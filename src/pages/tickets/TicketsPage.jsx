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
            <Box sx={{ p: 4, height: '100%', overflow: 'auto' }}>
                <Typography variant="h5" sx={{ mb: 4, fontWeight: 600, color: '#172b4d' }}>
                    Ticket Management
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0, bgcolor: 'background.default' }}>
                    {!id ? (
                        <>
                            <TicketFilters />
                            <TicketTable
                                onTicketClick={handleTicketClick}
                                selectedTicketId={selectedTicket?.id}
                            />
                        </>
                    ) : selectedTicket ? (
                        <TicketDetail
                            ticket={selectedTicket}
                            onClose={handleCloseDetail}
                        />
                    ) : (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 10 }}>
                            <CircularProgress />
                        </Box>
                    )}
                </Box>
            </Box>
        </MainLayout>
    );
};

export default TicketsPage;

