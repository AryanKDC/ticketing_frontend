import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Typography,
    Avatar,
    Chip,
    IconButton,
    Divider,
    TextField,
    Button,
    CircularProgress,
    Select,
    MenuItem,
    Stack,
    Tooltip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import { useDispatch, useSelector } from 'react-redux';
import { fetchComments, addComment, removeComment, clearComments } from '../../redux/slices/commentsSlice';
import { editTicket, fetchTickets, assignTicket } from '../../redux/slices/ticketsSlice';
import { fetchUsers } from '../../redux/slices/usersSlice';
import { toast } from 'sonner';
import AssignModal from '../common/AssignModel';

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const statusColors = {
    solved: '#10B981',
    open: '#3B82F6',
    pending: '#F59E0B',
    spam: '#94A3B8',
};

const TicketDetail = ({ ticket, onClose }) => {
    const [replyText, setReplyText] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [sending, setSending] = useState(false);
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [assignee, setAssignee] = useState('');
    const fileInputRef = useRef(null);

    const dispatch = useDispatch();
    const { comments } = useSelector((state) => state.comments);
    const { filters } = useSelector((state) => state.tickets);
    const { users } = useSelector((state) => state.users);
    const { token, user: currentUser } = useSelector((state) => state.auth);

    const ticketId = ticket._id || ticket.id;
    const statusKey = ticket.status?.toLowerCase() || 'open';
    const statusColor = statusColors[statusKey] || '#94A3B8';

    const requesterName = ticket.user?.name || 'Unknown';
    const requesterEmail = ticket.user?.email || '';
    const assigneeName = ticket.assignee?.name || 'unassigned';
    const assigneeEmail = ticket.assignee?.email || '';

    const isAdmin = currentUser?.type === 'admin';
    const isSupport = currentUser?.type === 'support';

    useEffect(() => {
        if (token && (isAdmin || isSupport)) {
            dispatch(fetchUsers({ token }));
        }
    }, [dispatch, token, isAdmin, isSupport]);

    useEffect(() => {
        if (token && ticketId) {
            dispatch(fetchComments({ ticketId, token }));
        }
        return () => {
            dispatch(clearComments());
        };
    }, [dispatch, token, ticketId]);

    const handleSendMessage = async () => {
        if (!replyText.trim() && selectedFiles.length === 0) return;
        setSending(true);
        try {
            const formData = new FormData();
            formData.append('ticket', ticket._id);
            formData.append('text', replyText);
            selectedFiles.forEach(file => formData.append('attachments', file));

            await dispatch(addComment({
                ticketId,
                data: formData,
                token,
            })).unwrap();
            toast.success("Comment added!");
            setReplyText('');
            setSelectedFiles([]);
            dispatch(fetchComments({ ticketId, token }));
        } catch (err) {
            toast.error(typeof err === 'string' ? err : (err?.message || "Failed to add comment"));
        } finally {
            setSending(false);
        }
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(prev => [...prev, ...files].slice(0, 5));
        e.target.value = '';
    };

    const handleRemoveFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleStatusChange = async (newStatus) => {
        try {
            await dispatch(editTicket({
                id: ticketId,
                data: { status: newStatus },
                token
            })).unwrap();
            dispatch(fetchTickets({ token, params: filters }));
            toast.success(`Status updated to ${newStatus}`);
        } catch (err) {
            toast.error(typeof err === 'string' ? err : (err?.message || "Failed to update status"));
        }
    };

    const openAssignModal = () => {
        setAssignee(ticket?.assignee?._id || '');
        setAssignModalOpen(true);
    };

    const closeAssignModal = () => {
        setAssignModalOpen(false);
    };

    const handleAssign = async () => {
        try {
            await dispatch(assignTicket({
                id: ticketId,
                data: { assignee },
                token
            })).unwrap();
            closeAssignModal();
            // Refresh ticket list or current ticket if needed
            // Since ticket is passed as prop, it might not update immediately unless the parent re-fetches
            // But usually the Detail view is opened from Table which should re-fetch
            dispatch(fetchTickets({ token, params: filters }));
            toast.success("Ticket assigned successfully");
        } catch (err) {
            toast.error(typeof err === 'string' ? err : (err?.message || "Failed to assign ticket"));
        }
    };

    const handleDeleteComment = (commentId) => {
        toast('Are you sure you want to delete this comment?', {
            description: "This action cannot be undone.",
            action: {
                label: 'Delete',
                onClick: async () => {
                    try {
                        await toast.promise(
                            dispatch(removeComment({ id: commentId, token })).unwrap(),
                            {
                                loading: 'Deleting...',
                                success: () => {
                                    dispatch(fetchComments({ ticketId, token }));
                                    return 'Comment deleted';
                                },
                                error: (err) => typeof err === 'string' ? err : (err?.message || 'Failed to delete comment'),
                            }
                        );
                    } catch (err) {
                    }
                },
            },
            cancel: {
                label: 'Cancel',
                onClick: () => console.log('Delete cancelled'),
            },
        });
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const getTimeAgo = (dateStr) => {
        const diffMs = new Date() - new Date(dateStr);
        const diffMin = Math.floor(diffMs / 60000);
        if (diffMin < 1) return 'Just now';
        if (diffMin < 60) return `${diffMin}m ago`;
        const diffHr = Math.floor(diffMin / 60);
        if (diffHr < 24) return `${diffHr}h ago`;
        return `${Math.floor(diffHr / 24)}d ago`;
    };

    function stringToColor(str) {
        if (!str) return '#94A3B8';
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const colors = ['#3b5998', '#1e293b', '#20b2aa', '#8b4513', '#0061FF', '#663399'];
        return colors[Math.abs(hash) % colors.length];
    }

    const isImageFile = (path) => /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(path);

    const getFileName = (path) => path.split('/').pop();

    const getFileUrl = (path) => `${BACKEND_URL}${path}`;

    const renderAttachments = (attachments) => {
        if (!attachments || attachments.length === 0) return null;
        return (
            <Stack spacing={1} sx={{ mt: 1.5 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                    <AttachFileIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                        Attachments ({attachments.length})
                    </Typography>
                </Stack>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {attachments.map((att, idx) => (
                        isImageFile(att) ? (
                            <Box
                                key={idx}
                                component="a"
                                href={getFileUrl(att)}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{
                                    display: 'block',
                                    width: 80,
                                    height: 80,
                                    borderRadius: 1.5,
                                    overflow: 'hidden',
                                    border: '1px solid #E2E8F0',
                                    '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.12)' },
                                    transition: '0.2s'
                                }}
                            >
                                <Box
                                    component="img"
                                    src={getFileUrl(att)}
                                    alt={getFileName(att)}
                                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </Box>
                        ) : (
                            <Chip
                                key={idx}
                                icon={<InsertDriveFileOutlinedIcon sx={{ fontSize: 16 }} />}
                                label={getFileName(att)}
                                size="small"
                                component="a"
                                href={getFileUrl(att)}
                                target="_blank"
                                rel="noopener noreferrer"
                                clickable
                                sx={{
                                    borderRadius: '8px',
                                    fontSize: '0.72rem',
                                    fontWeight: 500,
                                    bgcolor: '#F1F5F9',
                                    color: '#334155',
                                    border: '1px solid #E2E8F0',
                                    '&:hover': { bgcolor: '#E2E8F0' }
                                }}
                            />
                        )
                    ))}
                </Stack>
            </Stack>
        );
    };

    const SidebarItem = ({ label, children }) => (
        <Box sx={{ mb: 4 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {label}
            </Typography>
            {children}
        </Box>
    );

    return (
        <>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#fff', overflow: 'hidden' }}>

                {/* Header */}
                <Box sx={{
                    px: 3,
                    py: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    bgcolor: '#1E293B',
                    color: '#fff',
                    zIndex: 10,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Tooltip title="Back">
                            <IconButton
                                onClick={onClose}
                                size="small"
                                sx={{ color: '#94A3B8', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}
                            >
                                <ArrowBackIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Box>
                            <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, display: 'block', lineHeight: 1, mb: 0.5 }}>
                                TICKET VIEW
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#fff', fontWeight: 700, letterSpacing: '0.02em' }}>
                                #{ticket.ticketId || 'null'}
                            </Typography>
                        </Box>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                            label={statusKey.toUpperCase()}
                            size="small"
                            sx={{
                                bgcolor: statusColor,
                                color: '#fff',
                                fontWeight: 800,
                                fontSize: '0.65rem',
                                height: 24,
                                px: 1
                            }}
                        />
                        <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.1)', mx: 1 }} />
                        <IconButton size="small" onClick={onClose} sx={{ color: '#94A3B8', '&:hover': { color: '#ef4444' } }}>
                            <CloseIcon />
                        </IconButton>
                    </Stack>
                </Box>

                <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

                    {/* Left Content */}
                    <Box sx={{ flex: 1, overflowY: 'auto', px: { xs: 3, md: 6 }, py: 4 }}>
                        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: '#0F172A', letterSpacing: '-0.02em' }}>
                            {ticket.subject}
                        </Typography>

                        <Typography variant="caption" sx={{ color: 'text.disabled', mb: 4, display: 'block' }}>
                            Opened {new Date(ticket.createdAt).toLocaleString()}
                        </Typography>

                        {/* Description Area */}
                        <Box sx={{ mb: 6 }}>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                                <DescriptionOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>Description</Typography>
                            </Stack>
                            <Box sx={{
                                p: 3,
                                bgcolor: '#F8FAFC',
                                borderRadius: 2,
                                border: '1px solid #E2E8F0',
                                whiteSpace: 'pre-wrap'
                            }}>
                                <Typography variant="body1" sx={{ color: '#334155', lineHeight: 1.7, fontSize: '0.95rem' }}>
                                    {ticket.description || "No description provided."}
                                </Typography>
                                {renderAttachments(ticket.attachments)}
                            </Box>
                        </Box>

                        {/* Activity / Comments Header */}
                        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.1rem' }}>
                                Conversation History
                            </Typography>
                            <Chip label={comments.length} size="small" sx={{ fontWeight: 700, height: 20 }} />
                        </Box>

                        <Stack spacing={4} sx={{ mb: 10 }}>
                            {/* REPLY INPUT */}
                            <Box sx={{ display: 'flex', gap: 2, p: 2.5, borderRadius: 2, bgcolor: '#f1f5f966', border: '1px dashed #CBD5E1' }}>
                                <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontWeight: 600 }}>
                                    {getInitials(currentUser?.name)}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                    <TextField
                                        fullWidth multiline minRows={2}
                                        placeholder="Type your response here..."
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fff', borderRadius: 1.5 } }}
                                    />
                                    {selectedFiles.length > 0 && (
                                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                                            {selectedFiles.map((file, idx) => (
                                                <Chip
                                                    key={idx}
                                                    label={file.name}
                                                    size="small"
                                                    onDelete={() => handleRemoveFile(idx)}
                                                    deleteIcon={<CloseIcon sx={{ fontSize: 14 }} />}
                                                    sx={{
                                                        borderRadius: '8px',
                                                        fontSize: '0.72rem',
                                                        fontWeight: 500,
                                                        bgcolor: '#EFF6FF',
                                                        color: '#1E40AF',
                                                        border: '1px solid #BFDBFE'
                                                    }}
                                                />
                                            ))}
                                        </Stack>
                                    )}
                                    <input
                                        type="file"
                                        multiple
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                        style={{ display: 'none' }}
                                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                                    />
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1.5 }}>
                                        <Button
                                            startIcon={<AttachFileIcon />}
                                            size="small"
                                            onClick={() => fileInputRef.current?.click()}
                                            sx={{ textTransform: 'none', color: 'text.secondary' }}
                                        >
                                            Attach files
                                        </Button>
                                        <Button
                                            variant="contained"
                                            disabled={(!replyText.trim() && selectedFiles.length === 0) || sending}
                                            onClick={handleSendMessage}
                                            endIcon={sending ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
                                            sx={{ borderRadius: 2, px: 3, fontWeight: 700, textTransform: 'none' }}
                                        >
                                            Send Message
                                        </Button>
                                    </Stack>
                                </Box>
                            </Box>

                            {/* COMMENTS LIST */}
                            {comments.map((comment) => (
                                <Box key={comment._id} sx={{
                                    display: 'flex',
                                    gap: 2,
                                    p: 2,
                                    borderRadius: 2,
                                    transition: '0.2s',
                                    '&:hover': { bgcolor: '#F8FAFC' }
                                }}>
                                    <Avatar sx={{ width: 36, height: 36, bgcolor: stringToColor(comment.user?.name), fontSize: '0.85rem' }}>
                                        {getInitials(comment.user?.name)}
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                                    {comment.user?.name}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                                                    • {getTimeAgo(comment.createdAt)}
                                                </Typography>
                                            </Stack>

                                            {isAdmin && (
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleDeleteComment(comment._id)}
                                                    sx={{ color: 'text.disabled', '&:hover': { color: '#ef4444' } }}
                                                >
                                                    <DeleteOutlineIcon fontSize="small" />
                                                </IconButton>
                                            )}
                                        </Stack>
                                        <Typography variant="body2" sx={{ mt: 0.5, color: '#475569', lineHeight: 1.6 }}>
                                            {comment.text}
                                        </Typography>
                                        {renderAttachments(comment.attachments)}
                                    </Box>
                                </Box>
                            ))}
                        </Stack>
                    </Box>

                    {/* RIGHT SIDEBAR (Fixed Meta) */}
                    <Box sx={{ width: 300, borderLeft: '1px solid #E2E8F0', p: 4, bgcolor: '#fff', display: { xs: 'none', lg: 'block' } }}>

                        <SidebarItem label="Status">
                            {isAdmin || isSupport ? (
                                <Select
                                    fullWidth size="small"
                                    value={statusKey}
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                    sx={{ borderRadius: 2, fontWeight: 700, bgcolor: '#F1F5F9', '& fieldset': { border: 'none' } }}
                                >
                                    <MenuItem value="open">Open</MenuItem>
                                    <MenuItem value="pending">Pending</MenuItem>
                                    <MenuItem value="solved">Solved</MenuItem>
                                    <MenuItem value="spam">Spam</MenuItem>
                                </Select>
                            ) : (
                                <Chip
                                    label={statusKey.toUpperCase()}
                                    sx={{ bgcolor: statusColor + '15', color: statusColor, fontWeight: 800, borderRadius: 1.5 }}
                                />
                            )}
                        </SidebarItem>

                        <SidebarItem label="Assignee">
                            <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: assigneeName === 'unassigned' ? '#F1F5F9' : 'primary.main', color: assigneeName === 'unassigned' ? 'text.secondary' : '#fff' }}>
                                        {assigneeName !== 'unassigned' ? getInitials(assigneeName) : '?'}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{assigneeName}</Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{assigneeEmail || 'No agent assigned'}</Typography>
                                    </Box>
                                </Stack>
                                {(isAdmin || isSupport) && (
                                    <Button size="small" variant="text" onClick={openAssignModal} sx={{ textTransform: 'none', fontWeight: 600, minWidth: 'auto', p: 0.5 }}>
                                        {ticket?.assignee ? "Reassign" : "Assign"}
                                    </Button>
                                )}
                            </Stack>
                        </SidebarItem>

                        <SidebarItem label="Requester">
                            <Stack direction="row" spacing={1.5} alignItems="center">
                                <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: stringToColor(requesterName) }}>
                                    {getInitials(requesterName)}
                                </Avatar>
                                <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{requesterName}</Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{requesterEmail}</Typography>
                                </Box>
                            </Stack>
                        </SidebarItem>

                        <Divider sx={{ my: 4 }} />

                        <Stack spacing={2}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                                <AccessTimeIcon sx={{ fontSize: 16 }} />
                                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                                    Updated {ticket.updatedAt ? getTimeAgo(ticket.updatedAt) : 'recently'}
                                </Typography>
                            </Box>
                        </Stack>
                    </Box>
                </Box>
            </Box>

            {/* Assign Modal */}
            <AssignModal
                open={assignModalOpen}
                onClose={closeAssignModal}
                selectedTicket={ticket}
                assignee={assignee}
                setAssignee={setAssignee}
                handleAssign={handleAssign}
                users={users}
                currentUser={currentUser}
            />
        </>
    );
};

export default TicketDetail;