import React, { useState } from 'react';
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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useDispatch, useSelector } from 'react-redux';
import { setFilters, addTicket } from '../../redux/slices/ticketsSlice';

const TicketFilters = () => {
    const dispatch = useDispatch();
    const { filters } = useSelector((state) => state.tickets);
    const { token, user: currentUser } = useSelector((state) => state.auth);

    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [newTicket, setNewTicket] = useState({ subject: '', description: '', attachments: '' });

    const isSupport = currentUser?.type === 'support';

    const handleCreateTicket = () => {
        if (!newTicket.subject.trim() || !newTicket.description.trim()) return;
        const ticketData = {
            ...newTicket,
            attachments: newTicket.attachments.trim() ? [newTicket.attachments.trim()] : []
        };
        dispatch(addTicket({ data: ticketData, token }));
        setNewTicket({ subject: '', description: '', attachments: '' });
        setCreateDialogOpen(false);
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

                    <TextField
                        label="Attachment URL (Optional)"
                        fullWidth
                        value={newTicket.attachments}
                        onChange={(e) => setNewTicket({ ...newTicket, attachments: e.target.value })}
                        placeholder="https://example.com/image.png"
                        size="small"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '10px',
                            }
                        }}
                    />
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
