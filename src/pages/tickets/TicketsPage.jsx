import React from 'react';
import MainLayout from '../../components/layout/MainLayout';
import TicketFilters from '../../components/tickets/TicketFilters';
import TicketTable from '../../components/tickets/TicketTable';
import TicketDetail from '../../components/tickets/TicketDetail';
import { Box, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTicketById, clearSelectedTicket } from '../../redux/slices/ticketsSlice';

const TicketsPage = () => {
    const dispatch = useDispatch();
    const { selectedTicket } = useSelector((state) => state.tickets);
    const { token } = useSelector((state) => state.auth);

    const handleTicketClick = (ticket) => {
        dispatch(fetchTicketById({ id: ticket._id || ticket.id, token }));
    };

    const handleCloseDetail = () => {
        dispatch(clearSelectedTicket());
    };

    return (
        <MainLayout>
            <Box sx={{ p: 4, height: '100%', overflow: 'auto' }}>
                <Typography variant="h5" sx={{ mb: 4, fontWeight: 600, color: '#172b4d' }}>
                    Tickets Management
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0, bgcolor: 'background.default' }}>
                    {!selectedTicket ? (
                        <>
                            <TicketFilters />
                            <TicketTable
                                onTicketClick={handleTicketClick}
                                selectedTicketId={selectedTicket?.id}
                            />
                        </>
                    ) : (
                        <TicketDetail
                            ticket={selectedTicket}
                            onClose={handleCloseDetail}
                        />
                    )}
                </Box>
            </Box>
        </MainLayout>
    );
};

export default TicketsPage;

