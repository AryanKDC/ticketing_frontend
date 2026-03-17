import React from 'react';
import MainLayout from '../../components/layout/MainLayout';
import TicketFilters from '../../components/tickets/TicketFilters';
import TicketTable from '../../components/tickets/TicketTable';
import TicketDetail from '../../components/tickets/TicketDetail';
import { Box, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchTicketById, clearSelectedTicket } from '../../redux/slices/ticketsSlice';
import CircularProgress from '@mui/material/CircularProgress';

const TicketsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { selectedTicket, loading } = useSelector((state) => state.tickets);
    const { token } = useSelector((state) => state.auth);

    React.useEffect(() => {
        if (id && token) {
            // Only fetch if it's a different ticket or no ticket is selected
            if (!selectedTicket || (selectedTicket._id !== id && selectedTicket.id !== id)) {
                dispatch(fetchTicketById({ id, token }));
            }
        } else if (!id && selectedTicket) {
            dispatch(clearSelectedTicket());
        }
    }, [id, token, dispatch, selectedTicket]);

    const handleTicketClick = (ticket) => {
        navigate(`/tickets/${ticket._id || ticket.id}`);
    };

    const handleCloseDetail = () => {
        navigate('/tickets');
    };

    return (
        <MainLayout>
            <Box sx={{
                p: { xs: 0.5, md: 1 },
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 700, color: '#1E293B', px: 1 }}>
                    Ticket Management
                </Typography>

                <Box sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0,
                    bgcolor: 'background.default',
                    overflow: 'hidden',
                    borderRadius: 2,
                    border: '1px solid #E2E8F0'
                }}>
                    {!id ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <TicketFilters />
                            <TicketTable
                                onTicketClick={handleTicketClick}
                                selectedTicketId={selectedTicket?.id}
                            />
                        </Box>
                    ) : selectedTicket ? (
                        <TicketDetail
                            ticket={selectedTicket}
                            onClose={handleCloseDetail}
                        />
                    ) : (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                            <CircularProgress />
                        </Box>
                    )}
                </Box>
            </Box>
        </MainLayout>
    );
};

export default TicketsPage;

