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
import { toast } from 'sonner';
import AssignModal from '../common/AssignModel';
import socket from '../../socketio/socket';
import { receiveComment, fetchComments, addComment, removeComment, clearComments, removeCommentLocal } from '../../redux/slices/commentsSlice';
import { editTicket, fetchTickets, assignTicket } from '../../redux/slices/ticketsSlice';
import { fetchUsers } from '../../redux/slices/usersSlice';

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
    const messagesEndRef = useRef(null);

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
        if (!ticketId) return;

        socket.emit("joinTicket", ticketId);

        const handleNewComment = (comment) => {
            dispatch(receiveComment(comment));
        };

        const handleDeleteCommentSocket = (comment) => {
            const commentId = typeof comment === 'string' ? comment : comment._id;
            dispatch(removeCommentLocal(commentId));
            // No need to show toast for every deletion, it might be annoying, 
            // but let's keep it brief if needed. Actually, let's omit the toast for now.
        };

        const handleTicketUpdatedSocket = (updatedTicket) => {
            if (updatedTicket._id === ticketId) {
                // If we are viewing this ticket, refresh the list which will trigger a re-render if needed
                dispatch(fetchTickets({ token, params: filters }));
            }
        };

        const handleTicketDeletedSocket = (deletedTicketId) => {
            if (deletedTicketId === ticketId) {
                toast.error("This ticket has been deleted");
                onClose();
            }
        };

        socket.on("newComment", handleNewComment);
        socket.on("deleteComment", handleDeleteCommentSocket);
        socket.on("ticketUpdated", handleTicketUpdatedSocket);
        socket.on("ticketDeleted", handleTicketDeletedSocket);

        return () => {
            socket.emit("leaveTicket", ticketId);
            socket.off("newComment", handleNewComment);
            socket.off("deleteComment", handleDeleteCommentSocket);
            socket.off("ticketUpdated", handleTicketUpdatedSocket);
            socket.off("ticketDeleted", handleTicketDeletedSocket);
        };
    }, [ticketId, dispatch, token, filters, onClose]);

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

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (comments.length > 0) {
            scrollToBottom();
        }
    }, [comments]);

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

    const confirmDeleteComment = (commentId) => {
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
                                    // Local state will be updated via socket
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
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            width: '100%',
            overflow: 'hidden'
        }}>
            {/* Main Header */}
            <Box sx={{
                px: 2.5,
                py: 0.4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: '#1E293B',
                color: '#fff',
                zIndex: 10,
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
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
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, letterSpacing: '0.05em' }}>
                                TICKET
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#fff', fontWeight: 700 }}>
                                #{ticket.ticketId || 'null'}
                            </Typography>
                        </Stack>
                        <Typography variant="subtitle2" sx={{ color: '#E2E8F0', fontWeight: 600, maxWidth: 400, noWrap: true, textOverflow: 'ellipsis', display: 'block' }}>
                            {ticket.subject}
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
                            px: 1,
                            borderRadius: '4px'
                        }}
                    />
                    <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.1)', mx: 1 }} />
                    <IconButton size="small" onClick={onClose} sx={{ color: '#94A3B8', '&:hover': { color: '#ef4444' } }}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Stack>
            </Box>

            <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

                {/* LEFT PANEL: Ticket Details (Metadata & Description) */}
                <Box sx={{
                    width: { lg: 380, xl: 420 },
                    borderRight: '1px solid #E2E8F0',
                    display: { xs: 'none', lg: 'flex' },
                    flexDirection: 'column',
                    bgcolor: '#fff',
                    overflow: 'hidden'
                }}>
                    <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
                        <SidebarItem label="Description">
                            <Typography variant="body2" sx={{ color: '#334155', mb: 2, lineHeight: 1.7, whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>
                                {ticket.description || "No description provided."}
                            </Typography>
                            {renderAttachments(ticket.attachments)}
                        </SidebarItem>

                        <Divider sx={{ mb: 4 }} />

                        <SidebarItem label="Ticket Settings">
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block', fontWeight: 600 }}>Status</Typography>
                                {isAdmin || isSupport ? (
                                    <Select
                                        fullWidth size="small"
                                        value={statusKey}
                                        onChange={(e) => handleStatusChange(e.target.value)}
                                        sx={{
                                            borderRadius: 2,
                                            fontWeight: 600,
                                            fontSize: '0.875rem',
                                            bgcolor: '#F1F5F9',
                                            '& fieldset': { border: 'none' }
                                        }}
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
                            </Box>

                            <Box sx={{ mb: 3 }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block', fontWeight: 600 }}>Assigned To</Typography>
                                <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between" sx={{ p: 1, border: '1px solid #F1F5F9', borderRadius: 2 }}>
                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                        <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: assigneeName === 'unassigned' ? '#F1F5F9' : 'primary.main' }}>
                                            {assigneeName !== 'unassigned' ? getInitials(assigneeName) : '?'}
                                        </Avatar>
                                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>{assigneeName}</Typography>
                                    </Stack>
                                    {(isAdmin || isSupport) && (
                                        <Button size="small" variant="text" onClick={openAssignModal} sx={{ textTransform: 'none', fontWeight: 600, minWidth: 'auto', p: 0.5, fontSize: '0.75rem' }}>
                                            {ticket.assignee ? 'Reassign' : 'Assign'}
                                        </Button>
                                    )}
                                </Stack>
                            </Box>

                            <Box>
                                <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block', fontWeight: 600 }}>Requester</Typography>
                                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 1, border: '1px solid #F1F5F9', borderRadius: 2 }}>
                                    <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: stringToColor(requesterName) }}>
                                        {getInitials(requesterName)}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>{requesterName}</Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.7rem' }} noWrap>{requesterEmail}</Typography>
                                    </Box>
                                </Stack>
                            </Box>
                        </SidebarItem>

                        <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid #F1F5F9' }}>
                            <Stack spacing={1.5}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                                    <AccessTimeIcon sx={{ fontSize: 14 }} />
                                    <Typography variant="caption" sx={{ fontWeight: 500 }}>
                                        Created: {new Date(ticket.createdAt).toLocaleString()}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                                    <AccessTimeIcon sx={{ fontSize: 14 }} />
                                    <Typography variant="caption" sx={{ fontWeight: 500 }}>
                                        Last Update: {ticket.updatedAt ? getTimeAgo(ticket.updatedAt) : 'recently'}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Box>
                    </Box>
                </Box>

                {/* RIGHT PANEL: Conversation History (Main Highlight) */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: '#F1F5F9', position: 'relative', overflow: 'hidden' }}>

                    {/* Conversation Header */}
                    <Box sx={{
                        px: { xs: 2, md: 4 },
                        py: 1,
                        bgcolor: '#fff',
                        borderBottom: '1px solid #E2E8F0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                                Conversation
                            </Typography>
                            <Chip
                                label={comments.length}
                                size="small"
                                sx={{
                                    fontWeight: 700,
                                    height: 20,
                                    bgcolor: '#E2E8F0',
                                    color: '#475569',
                                    fontSize: '0.7rem'
                                }}
                            />
                        </Stack>
                    </Box>

                    {/* Scrollable Comments List */}
                    <Box sx={{ flex: 1, overflowY: 'auto', px: { xs: 2, md: 4 }, py: 3, display: 'flex', flexDirection: 'column' }}>
                        <Stack spacing={2.5}>
                            {comments.map((comment, index) => (
                                <Box key={comment._id} sx={{
                                    display: 'flex',
                                    gap: 2,
                                    p: 2.5,
                                    borderRadius: 3,
                                    bgcolor: '#fff',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                                    border: '1px solid #E2E8F0',
                                    transition: '0.2s',
                                    maxWidth: '85%',
                                    alignSelf: comment.user?._id === currentUser?._id ? 'flex-end' : 'flex-start',
                                    '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }
                                }}>
                                    <Avatar sx={{
                                        width: 32,
                                        height: 32,
                                        bgcolor: stringToColor(comment.user?.name),
                                        fontSize: '0.8rem'
                                    }}>
                                        {getInitials(comment.user?.name)}
                                    </Avatar>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', fontSize: '0.85rem' }}>
                                                    {comment.user?.name}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                                                    {getTimeAgo(comment.createdAt)}
                                                </Typography>
                                            </Stack>

                                            {(isAdmin || currentUser?._id === comment.user?._id) && (
                                                <IconButton
                                                    size="small"
                                                    onClick={() => confirmDeleteComment(comment._id)}
                                                    sx={{ color: 'text.disabled', '&:hover': { color: '#ef4444' }, p: 0.5 }}
                                                >
                                                    <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                                                </IconButton>
                                            )}
                                        </Stack>
                                        <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.6, fontSize: '0.9rem', wordBreak: 'break-word' }}>
                                            {comment.text}
                                        </Typography>
                                        {renderAttachments(comment.attachments)}
                                    </Box>
                                </Box>
                            ))}
                            {comments.length === 0 && (
                                <Box sx={{ py: 10, textAlign: 'center' }}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                                        No comments yet. Start the conversation!
                                    </Typography>
                                </Box>
                            )}
                            <div ref={messagesEndRef} />
                        </Stack>
                        {/* Space for anchored reply box */}
                        <Box sx={{ minHeight: 80 }} />
                    </Box>

                    {/* Anchored Reply Box */}
                    <Box sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        p: 1,
                        bgcolor: 'rgba(255,255,255,0.8)',
                        backdropFilter: 'blur(8px)',
                        borderTop: '1px solid #E2E8F0',
                        zIndex: 20
                    }}>
                        <Box sx={{
                            display: 'flex',
                            gap: 1,
                            p: 1,
                            borderRadius: 2,
                            bgcolor: '#fff',
                            border: '1px solid #CBD5E1',
                            boxShadow: '0 -1px 8px rgba(0,0,0,0.02)'
                        }}>
                            <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main', fontWeight: 600, fontSize: '0.75rem' }}>
                                {getInitials(currentUser?.name)}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                                <TextField
                                    fullWidth multiline minRows={1} maxRows={4}
                                    placeholder="Type your message..."
                                    variant="standard"
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    InputProps={{
                                        disableUnderline: true,
                                        sx: { fontSize: '0.875rem', py: 0.25 }
                                    }}
                                />
                                {selectedFiles.length > 0 && (
                                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                                        {selectedFiles.map((file, idx) => (
                                            <Chip
                                                key={idx}
                                                label={file.name}
                                                size="small"
                                                onDelete={() => handleRemoveFile(idx)}
                                                deleteIcon={<CloseIcon sx={{ fontSize: 12 }} />}
                                                sx={{
                                                    borderRadius: '6px',
                                                    fontSize: '0.65rem',
                                                    fontWeight: 600,
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
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
                                    <IconButton
                                        size="small"
                                        onClick={() => fileInputRef.current?.click()}
                                        sx={{ color: 'text.secondary' }}
                                    >
                                        <AttachFileIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                    <Button
                                        variant="contained"
                                        disabled={(!replyText.trim() && selectedFiles.length === 0) || sending}
                                        onClick={handleSendMessage}
                                        size="small"
                                        endIcon={sending ? <CircularProgress size={14} color="inherit" /> : <SendIcon sx={{ fontSize: 14 }} />}
                                        sx={{
                                            borderRadius: '8px',
                                            px: 2.5,
                                            py: 0.75,
                                            fontWeight: 700,
                                            textTransform: 'none',
                                            boxShadow: 'none'
                                        }}
                                    >
                                        Send
                                    </Button>
                                </Stack>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>

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
        </Box>
    );
};

export default TicketDetail;