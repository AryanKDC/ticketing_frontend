import React, { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    Typography,
    Box,
    Chip,
    CircularProgress,
    Alert,
    Select,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TableSortLabel,
    FormControl,
    Autocomplete,
    TextField,
    Stack,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTickets, editTicket, assignTicket, removeTicket, setFilters } from '../../redux/slices/ticketsSlice';
import { fetchUsers } from '../../redux/slices/usersSlice';
import { toast } from 'sonner';
import moment from 'moment';
import ActionMenu from '../common/ActionMenu';
import { TablePagination } from "@mui/material";
import AssignModal from '../common/AssignModel';

const statusColors = {
    solved: { bgcolor: '#10B981' },
    open: { bgcolor: '#3B82F6' },
    pending: { bgcolor: '#F59E0B' },
    spam: { bgcolor: '#94A3B8' },
};

const TicketTable = ({ onTicketClick, selectedTicketId }) => {
    const dispatch = useDispatch();
    const { tickets, loading, error, filters, pagination, total } = useSelector((state) => state.tickets);
    const { token, user: currentUser } = useSelector((state) => state.auth);
    const { users } = useSelector((state) => state.users);

    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [assignee, setAssignee] = useState('');

    const isAdmin = currentUser?.type === 'admin';
    const isSupport = currentUser?.type === 'support';

    const openAssignModal = (ticket) => {
        setSelectedTicket(ticket);
        setAssignee(ticket?.assignee?._id || '');
        setAssignModalOpen(true);
    };

    const closeAssignModal = () => {
        setAssignModalOpen(false);
        setSelectedTicket(null);
    };

    const handleAssign = async () => {
        if (!selectedTicket) return;

        try {
            await dispatch(assignTicket({
                id: selectedTicket._id,
                data: { assignee },
                token
            })).unwrap();

            toast.success("Ticket assigned successfully!");
            closeAssignModal();

            // Refresh ticket list
            const params = {
                page: filters.page,
                limit: filters.limit
            };
            if (filters.status) params.status = filters.status;
            if (filters.search) params.search = filters.search;
            if (filters.unassigned) params.unassigned = 'true';
            if (filters.myTickets) params.myTickets = 'true';
            if (filters.sortBy) {
                params.sort = filters.order === 'desc' ? `-${filters.sortBy}` : filters.sortBy;
            }
            dispatch(fetchTickets({ token, params }));
        } catch (err) {
            toast.error(err || "Failed to assign ticket");
        }
    };

    const handlePageChange = (event, newPage) => {
        dispatch(setFilters({ page: newPage + 1 }));
    };

    const handleRowsPerPageChange = (event) => {
        dispatch(setFilters({
            limit: parseInt(event.target.value, 10),
            page: 1
        }));
    };

    const handleSort = (property) => {
        const isAsc = filters.sortBy === property && filters.order === 'asc';
        dispatch(setFilters({
            sortBy: property,
            order: isAsc ? 'desc' : 'asc',
            page: 1 // Reset to first page on sort
        }));
    };

    const handleStatusChange = async (ticketId, newStatus) => {
        try {
            await dispatch(editTicket({
                id: ticketId,
                data: { status: newStatus },
                token
            })).unwrap();

            toast.success("Ticket updated successfully!");

            // Refresh ticket list
            const params = {
                page: filters.page,
                limit: filters.limit
            };
            if (filters.status) params.status = filters.status;
            if (filters.search) params.search = filters.search;
            if (filters.unassigned) params.unassigned = 'true';
            if (filters.myTickets) params.myTickets = 'true';
            if (filters.sortBy) {
                params.sort = filters.order === 'desc' ? `-${filters.sortBy}` : filters.sortBy;
            }
            dispatch(fetchTickets({ token, params }));
        } catch (err) {
            const message = err.message || "Failed to update status";
            toast.error(message);
        }
    };

    const handleItemAction = async (menuItem) => {
        const { action, row } = menuItem;

        switch (action) {
            case "view":
                onTicketClick && onTicketClick(row);
                break;

            case "assign":
                openAssignModal(row);
                break;

            case "delete":
                toast("Delete this ticket?", {
                    description: "This action cannot be undone.",
                    action: {
                        label: "Delete",
                        onClick: async () => {
                            try {
                                await dispatch(removeTicket({ id: row._id, token })).unwrap();
                                toast.success("Ticket deleted successfully!");

                                if (tickets.length === 1 && filters.page > 1) {
                                    dispatch(setFilters({ page: filters.page - 1 }));
                                } else {
                                    const params = {
                                        page: filters.page,
                                        limit: filters.limit
                                    };
                                    if (filters.status) params.status = filters.status;
                                    if (filters.search) params.search = filters.search;
                                    if (filters.unassigned) params.unassigned = 'true';
                                    if (filters.myTickets) params.myTickets = 'true';
                                    if (filters.sortBy) {
                                        params.sort = filters.order === 'desc' ? `-${filters.sortBy}` : filters.sortBy;
                                    }

                                    dispatch(fetchTickets({ token, params }));
                                }
                            } catch (err) {
                                toast.error(err || "Failed to delete ticket");
                            }
                        },
                    },
                    cancel: {
                        label: "Cancel",
                    },
                    duration: 5000,
                });
                break;

            default:
                toast.info(`Action "${action}" clicked`);
                break;
        }
    };


    useEffect(() => {
        if (token) {
            const params = {};
            if (filters.status) params.status = filters.status;
            if (filters.search) params.search = filters.search;
            if (filters.unassigned) params.unassigned = 'true';
            if (filters.myTickets) params.myTickets = 'true';
            params.page = filters.page;
            params.limit = filters.limit;

            // Sorting logic
            if (filters.sortBy) {
                params.sort = filters.order === 'desc' ? `-${filters.sortBy}` : filters.sortBy;
            }

            dispatch(fetchTickets({ token, params }));

            if (isAdmin) {
                dispatch(fetchUsers({ token }));
            }
        }
    }, [dispatch, token, filters, isAdmin, isSupport]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    // const AssignModal = ({
    //     open,
    //     onClose,
    //     selectedTicket,
    //     assignee,
    //     setAssignee,
    //     handleAssign,
    //     users,
    //     currentUser
    // }) => (
    //     <Dialog
    //         open={open}
    //         onClose={onClose}
    //         fullWidth
    //         maxWidth="xs"
    //         PaperProps={{
    //             elevation: 0,
    //             sx: {
    //                 borderRadius: 3,
    //                 boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
    //                 m: 2
    //             }
    //         }}
    //     >
    //         <DialogTitle sx={{
    //             pb: 1,
    //             pt: 3,
    //             px: 3,
    //             fontWeight: 600,
    //             fontSize: '1.25rem'
    //         }}>
    //             {selectedTicket?.assignee ? "Reassign Ticket" : "Assign Ticket"}
    //         </DialogTitle>

    //         <DialogContent
    //             sx={{
    //                 display: "flex",
    //                 flexDirection: "column",
    //                 gap: 2.5,
    //                 px: 3,
    //                 pt: '16px !important'
    //             }}
    //         >
    //             <Box sx={{
    //                 p: 1.5,
    //                 bgcolor: 'action.hover',
    //                 borderRadius: 1,
    //                 border: '1px solid',
    //                 borderColor: 'divider'
    //             }}>
    //                 <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, display: 'block', mb: 0.5 }}>
    //                     Ticket Subject
    //                 </Typography>
    //                 <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>
    //                     {selectedTicket?.subject || "No subject provided"}
    //                 </Typography>
    //             </Box>

    //             <FormControl fullWidth size="small">
    //                 <Typography variant="caption" sx={{ mb: 1, fontWeight: 500, color: 'text.secondary' }}>
    //                     Select Agent
    //                 </Typography>

    //                 <Autocomplete
    //                     value={users.find(u => u._id === assignee) || null}
    //                     onChange={(event, newValue) => setAssignee(newValue?._id || "")}
    //                     options={users.filter(u => u.type === 'admin' || u.type === 'support')}
    //                     getOptionLabel={(option) => `${option.name} (${option.email})`}
    //                     isOptionEqualToValue={(option, value) => option._id === value._id}
    //                     renderInput={(params) => (
    //                         <TextField
    //                             {...params}
    //                             placeholder="Select Agent"
    //                             size="small"
    //                             sx={{
    //                                 borderRadius: 2,
    //                                 '& .MuiOutlinedInput-notchedOutline': {
    //                                     borderColor: 'divider'
    //                                 },
    //                                 '&:hover .MuiOutlinedInput-notchedOutline': {
    //                                     borderColor: 'primary.main'
    //                                 }
    //                             }}
    //                         />
    //                     )}
    //                     noOptionsText="No agents available"
    //                 />
    //             </FormControl>
    //         </DialogContent>

    //         <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1 }}>
    //             <Button
    //                 disableRipple
    //                 onClick={onClose}
    //                 sx={{
    //                     borderRadius: 2,
    //                     color: 'text.secondary',
    //                     textTransform: 'none',
    //                     fontWeight: 600,
    //                     '&:hover': { bgcolor: 'action.hover' }
    //                 }}
    //             >
    //                 Cancel
    //             </Button>

    //             <Button
    //                 variant="contained"
    //                 disableElevation
    //                 onClick={handleAssign}
    //                 disabled={!assignee}
    //                 sx={{
    //                     borderRadius: 2,
    //                     px: 3,
    //                     textTransform: 'none',
    //                     fontWeight: 600
    //                 }}
    //             >
    //                 {selectedTicket?.assignee ? "Reassign" : "Assign"}
    //             </Button>
    //         </DialogActions>
    //     </Dialog>
    // );

    // Helper: generate a consistent color from a string
    function stringToColor(str) {
        if (!str) return '#94A3B8';
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const colors = ['#3b5998', '#a52a2a', '#20b2aa', '#8b4513', '#daa520', '#4169e1', '#cd5c5c', '#663399', '#2f4f4f', '#0061FF'];
        return colors[Math.abs(hash) % colors.length];
    }

    // Helper: get relative time string
    function getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);

        if (diffSec < 60) return `${diffSec} seconds ago`;
        if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
        if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
        return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    }


    return (
        <>
            <TableContainer
                component={Box}
                sx={{
                    flexGrow: 1,
                    overflow: 'auto',
                    bgcolor: '#ffffff',
                    '& .MuiTable-root': {
                        borderCollapse: 'separate',
                        borderSpacing: 0,
                    },
                    '& .MuiTableCell-root': {
                        py: 0.8,
                        px: 1.5
                    }
                }}
            >
                <Table stickyHeader aria-label="tickets table">

                    <TableHead>
                        <TableRow>

                            <TableCell sx={{ fontSize: '0.7rem', color: 'text.secondary', fontWeight: 700, bgcolor: '#F8FAFC' }}>
                                Sr. No
                            </TableCell>

                            <TableCell sx={{ fontSize: '0.7rem', color: 'text.secondary', fontWeight: 700, bgcolor: '#F8FAFC' }}>
                                <TableSortLabel
                                    active={filters.sortBy === 'user.name'}
                                    direction={filters.sortBy === 'user.name' ? filters.order : 'asc'}
                                    onClick={() => handleSort('user.name')}
                                >
                                    REQUESTER
                                </TableSortLabel>
                            </TableCell>

                            <TableCell sx={{ fontSize: '0.7rem', color: 'text.secondary', fontWeight: 700, bgcolor: '#F8FAFC' }}>
                                <TableSortLabel
                                    active={filters.sortBy === 'subject'}
                                    direction={filters.sortBy === 'subject' ? filters.order : 'asc'}
                                    onClick={() => handleSort('subject')}
                                >
                                    SUBJECT
                                </TableSortLabel>
                            </TableCell>

                            <TableCell sx={{ fontSize: '0.7rem', color: 'text.secondary', fontWeight: 700, bgcolor: '#F8FAFC' }}>
                                ASSIGNED TO
                            </TableCell>

                            <TableCell sx={{ fontSize: '0.7rem', color: 'text.secondary', fontWeight: 700, bgcolor: '#F8FAFC' }}>
                                <TableSortLabel
                                    active={filters.sortBy === 'status'}
                                    direction={filters.sortBy === 'status' ? filters.order : 'asc'}
                                    onClick={() => handleSort('status')}
                                >
                                    STATUS
                                </TableSortLabel>
                            </TableCell>

                            <TableCell sx={{ fontSize: '0.7rem', color: 'text.secondary', fontWeight: 700, bgcolor: '#F8FAFC' }}>
                                <TableSortLabel
                                    active={filters.sortBy === 'lastMessage'}
                                    direction={filters.sortBy === 'lastMessage' ? filters.order : 'asc'}
                                    onClick={() => handleSort('lastMessage')}
                                >
                                    LAST MESSAGE
                                </TableSortLabel>
                            </TableCell>

                            <TableCell sx={{ fontSize: '0.7rem', color: 'text.secondary', fontWeight: 700, bgcolor: '#F8FAFC' }}>
                                <TableSortLabel
                                    active={filters.sortBy === 'createdAt'}
                                    direction={filters.sortBy === 'createdAt' ? filters.order : 'asc'}
                                    onClick={() => handleSort('createdAt')}
                                >
                                    CREATED AT
                                </TableSortLabel>
                            </TableCell>

                            <TableCell sx={{ fontSize: '0.7rem', color: 'text.secondary', fontWeight: 700, bgcolor: '#F8FAFC' }}>
                                ACTIONS
                            </TableCell>

                        </TableRow>
                    </TableHead>

                    <TableBody>

                        {tickets.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    <Typography variant="body2" sx={{ color: "text.secondary", py: 2 }}>
                                        No tickets found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (

                            tickets.map((ticket, index) => {

                                const isSelected = selectedTicketId === ticket._id;
                                const requesterName = ticket.user?.name || 'Unknown';
                                const requesterEmail = ticket.user?.email || '';
                                const assigneeName = ticket.assignee?.name || 'unassigned';
                                const assigneeEmail = ticket.assignee?.email || '';
                                const statusKey = ticket.status?.toLowerCase() || 'open';
                                const statusDisplay = ticket.status ? ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1) : 'Open';
                                const statusStyle = statusColors[statusKey] || statusColors.open;
                                const createdAt = moment(ticket.createdAt).format('DD-MM-YYYY');

                                const timeDiff = ticket.lastMessage
                                    ? getTimeAgo(new Date(ticket.lastMessage))
                                    : 'N/A';

                                return (

                                    <TableRow
                                        key={ticket._id}
                                        hover
                                        sx={{
                                            bgcolor: isSelected ? 'rgba(0, 97, 255, 0.06)' : 'transparent',
                                            '&:hover': { bgcolor: isSelected ? 'rgba(0, 97, 255, 0.08) !important' : 'rgba(0, 97, 255, 0.02) !important' },
                                            '& td': { transition: 'background-color 0.2s' },
                                            ...(isSelected && {
                                                borderLeft: '2px solid',
                                                borderLeftColor: 'primary.main',
                                            }),
                                        }}
                                    >

                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                                                {(filters.page - 1) * filters.limit + index + 1}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>

                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>

                                                <Avatar
                                                    sx={{
                                                        width: 26,
                                                        height: 26,
                                                        fontSize: '0.65rem',
                                                        fontWeight: 700,
                                                        bgcolor: stringToColor(requesterName),
                                                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                                    }}
                                                >
                                                    {getInitials(requesterName)}
                                                </Avatar>

                                                <Box>

                                                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.75rem' }}>
                                                        {requesterName}
                                                    </Typography>

                                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.65rem' }}>
                                                        {requesterEmail}
                                                    </Typography>

                                                </Box>

                                            </Box>

                                        </TableCell>

                                        <TableCell>
                                            <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.75rem' }}>
                                                {ticket.subject}
                                            </Typography>
                                        </TableCell>

                                        <TableCell sx={{ verticalAlign: 'middle', py: 1.5 }}>
                                            {assigneeName === 'unassigned' || !assigneeName ? (
                                                <Chip
                                                    label="Unassigned"
                                                    size="small"
                                                    sx={{
                                                        color: 'text.secondary',
                                                        bgcolor: 'action.hover',
                                                        fontWeight: 500,
                                                        borderRadius: 2,
                                                        height: 24,
                                                        border: '1px dashed',
                                                        borderColor: 'divider'
                                                    }}
                                                />
                                            ) : (
                                                <Stack spacing={0.25}>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontWeight: 600,
                                                            color: 'text.primary',
                                                            lineHeight: 1.2
                                                        }}
                                                    >
                                                        {assigneeName}
                                                    </Typography>
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            color: 'text.secondary',
                                                            fontWeight: 400,
                                                            lineHeight: 1.2
                                                        }}
                                                    >
                                                        {assigneeEmail}
                                                    </Typography>
                                                </Stack>
                                            )}
                                        </TableCell>

                                        <TableCell>

                                            {isAdmin || isSupport ? (

                                                <Select
                                                    value={statusKey}
                                                    onChange={(e) => {
                                                        e.stopPropagation();
                                                        handleStatusChange(ticket._id, e.target.value);
                                                    }}
                                                    onClick={(e) => e.stopPropagation()}
                                                    size="small"
                                                    sx={{
                                                        fontSize: '0.72rem',
                                                        fontWeight: 800,
                                                        height: 28,
                                                        borderRadius: '6px',
                                                        minWidth: 90,
                                                        '& .MuiSelect-select': {
                                                            color: statusStyle.bgcolor,
                                                            bgcolor: statusStyle.bgcolor + '10',
                                                        }
                                                    }}
                                                >

                                                    <MenuItem value="open">Open</MenuItem>
                                                    <MenuItem value="pending">Pending</MenuItem>
                                                    <MenuItem value="solved">Solved</MenuItem>
                                                    <MenuItem value="spam">Spam</MenuItem>

                                                </Select>

                                            ) : (

                                                <Chip
                                                    label={statusDisplay}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: statusStyle.bgcolor + '20',
                                                        color: statusStyle.bgcolor,
                                                        borderRadius: '6px',
                                                        height: 20,
                                                        fontSize: '0.7rem',
                                                        fontWeight: 800,
                                                        border: '1px solid',
                                                        borderColor: statusStyle.bgcolor + '40'
                                                    }}
                                                />

                                            )}

                                        </TableCell>

                                        <TableCell>
                                            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.72rem' }}>
                                                {timeDiff}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.72rem' }}>
                                                {createdAt}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>

                                            <ActionMenu
                                                menuItems={[
                                                    {
                                                        icon: <VisibilityIcon fontSize="small" />,
                                                        title: "View",
                                                        action: "view",
                                                        show: true,
                                                        row: ticket,
                                                    },
                                                    {
                                                        icon: <AssignmentIndIcon fontSize="small" />,
                                                        title: "Assign",
                                                        action: "assign",
                                                        show: isAdmin || isSupport,
                                                        row: ticket,
                                                    },
                                                    {
                                                        icon: <DeleteIcon fontSize="small" />,
                                                        title: "Delete",
                                                        action: "delete",
                                                        show: isAdmin,
                                                        row: ticket,
                                                    },
                                                ].filter((ele) => ele.show)}
                                                onClickCallback={(item) => handleItemAction(item)}
                                            />

                                        </TableCell>

                                    </TableRow>

                                );

                            })

                        )}

                    </TableBody>

                </Table>
            </TableContainer>

            <TablePagination
                component="div"
                count={pagination.total || total}
                page={(pagination.page || filters.page || 1) - 1}
                onPageChange={handlePageChange}
                rowsPerPage={pagination.limit || filters.limit || 5}
                onRowsPerPageChange={handleRowsPerPageChange}
                rowsPerPageOptions={[5, 10, 25, 50]}
                sx={{
                    '& .MuiTablePagination-toolbar': {
                        minHeight: 42,
                        fontSize: '0.75rem'
                    }
                }}
            />

            {/* Assign Modal */}
            <AssignModal
                open={assignModalOpen}
                onClose={closeAssignModal}
                selectedTicket={selectedTicket}
                assignee={assignee}
                setAssignee={setAssignee}
                handleAssign={handleAssign}
                users={users}
                currentUser={currentUser}
            />

        </>
    );
};

export default TicketTable;