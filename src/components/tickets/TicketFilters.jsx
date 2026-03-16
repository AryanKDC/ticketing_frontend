import React, { useState, useRef } from 'react';
import {
    Box,
    Typography,
    Chip,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch, useSelector } from 'react-redux';
import { setFilters, addTicket } from '../../redux/slices/ticketsSlice';
import { toast } from 'sonner';

const TicketFilters = () => {
    const dispatch = useDispatch();
    const { filters } = useSelector((state) => state.tickets);
    const { token, user: currentUser } = useSelector((state) => state.auth);

    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [newTicket, setNewTicket] = useState({ subject: '', description: '' });
    const [selectedFiles, setSelectedFiles] = useState([]);
    const fileInputRef = useRef(null);

    const isSupport = currentUser?.type === 'support';

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(prev => [...prev, ...files].slice(0, 5));
        e.target.value = '';
    };

    const handleRemoveFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleCreateTicket = async () => {
        if (!newTicket.subject.trim() || !newTicket.description.trim()) return;
        const formData = new FormData();
        formData.append('subject', newTicket.subject);
        formData.append('description', newTicket.description);
        selectedFiles.forEach(file => formData.append('attachments', file));
        try {
            await dispatch(addTicket({ data: formData, token })).unwrap();
            toast.success("Ticket created successfully!");
            setNewTicket({ subject: '', description: '' });
            setSelectedFiles([]);
            setCreateDialogOpen(false);
        } catch (err) {
            toast.error(err || "Failed to create ticket");
        }
    };


    return (
        <Box sx={{ p: 2, borderBottom: '1px solid #E2E8F0', bgcolor: '#ffffff' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                        sx={{
                            border: '1px solid #E2E8F0',
                            color: 'text.primary',
                            bgcolor: '#ffffff',
                            height: 32,
                            px: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            borderRadius: '10px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                    >
                        Active Filters:
                    </Box>

                    {filters.status && (
                        <Chip
                            label={`Status: ${filters.status}`}
                            onDelete={() => dispatch(setFilters({ status: null, page: 1 }))}
                            sx={{
                                bgcolor: 'primary.light',
                                color: 'primary.main',
                                borderRadius: '10px',
                                border: '1px solid',
                                borderColor: 'rgba(0, 97, 255, 0.1)',
                                fontWeight: 600,
                                height: 30,
                                fontSize: '0.72rem'
                            }}
                        />
                    )}

                    {filters.search && (
                        <Chip
                            label={`Search: "${filters.search}"`}
                            onDelete={() => dispatch(setFilters({ search: "", page: 1 }))}
                            sx={{
                                bgcolor: 'primary.light',
                                color: 'primary.main',
                                borderRadius: '10px',
                                border: '1px solid',
                                borderColor: 'rgba(0, 97, 255, 0.1)',
                                fontWeight: 600,
                                height: 30,
                                fontSize: '0.72rem'
                            }}
                        />
                    )}

                    {filters.unassigned && (
                        <Chip
                            label="Unassigned"
                            onDelete={() => dispatch(setFilters({ unassigned: false, page: 1 }))}
                            sx={{
                                bgcolor: 'primary.light',
                                color: 'primary.main',
                                borderRadius: '10px',
                                border: '1px solid',
                                borderColor: 'rgba(0, 97, 255, 0.1)',
                                fontWeight: 600,
                                height: 30,
                                fontSize: '0.72rem'
                            }}
                        />
                    )}
                </Box>

                {!isSupport && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon sx={{ fontSize: 18 }} />}
                        onClick={() => setCreateDialogOpen(true)}
                        sx={{
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontWeight: 700,
                            px: 2,
                            py: 0.6,
                            fontSize: '0.75rem',
                            background: 'linear-gradient(135deg, #0061FF 0%, #60EFFF 100%)',
                            boxShadow: '0 3px 8px rgba(0, 97, 255, 0.25)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #0056E0 0%, #50DFF0 100%)',
                                boxShadow: '0 4px 10px rgba(0, 97, 255, 0.35)',
                            }
                        }}
                    >
                        Create Ticket
                    </Button>
                )}
            </Box>

            {/* Create Ticket Dialog */}
            <Dialog
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '16px',
                        bgcolor: '#ffffff',
                        boxShadow: '0 16px 30px rgba(0,0,0,0.08)'
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 700, fontSize: '1.2rem', pb: 0.5 }}>
                    Create New Ticket
                </DialogTitle>

                <DialogContent>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, fontSize: '0.8rem' }}>
                        Fill in the details below to raise a new support ticket.
                    </Typography>

                    <TextField
                        autoFocus
                        label="Subject"
                        fullWidth
                        value={newTicket.subject}
                        onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                        placeholder="Briefly describe the issue"
                        size="small"
                        sx={{
                            mb: 2,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '10px',
                            }
                        }}
                    />

                    <TextField
                        label="Description"
                        fullWidth
                        multiline
                        minRows={3}
                        value={newTicket.description}
                        onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                        placeholder="Provide more details about the problem..."
                        size="small"
                        sx={{
                            mb: 2,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '10px',
                            }
                        }}
                    />

                    <input
                        type="file"
                        multiple
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                    />
                    <Button
                        variant="outlined"
                        startIcon={<AttachFileIcon />}
                        onClick={() => fileInputRef.current?.click()}
                        sx={{
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            borderStyle: 'dashed',
                            color: 'text.secondary',
                            borderColor: '#CBD5E1',
                            '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(0,97,255,0.04)' }
                        }}
                    >
                        Attach Files (max 5)
                    </Button>
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
                </DialogContent>

                <DialogActions sx={{ px: 2, pb: 2, gap: 0.5 }}>
                    <Button
                        onClick={() => setCreateDialogOpen(false)}
                        sx={{
                            color: 'text.secondary',
                            fontWeight: 600,
                            textTransform: 'none',
                            fontSize: '0.75rem'
                        }}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        onClick={handleCreateTicket}
                        disabled={!newTicket.subject.trim() || !newTicket.description.trim()}
                        sx={{
                            borderRadius: '10px',
                            fontWeight: 700,
                            textTransform: 'none',
                            fontSize: '0.75rem',
                            px: 3,
                            background: 'linear-gradient(135deg, #0061FF 0%, #60EFFF 100%)',
                        }}
                    >
                        Create Ticket
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TicketFilters;
