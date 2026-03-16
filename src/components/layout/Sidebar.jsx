import React, { useState, useEffect } from 'react';
import {
    Box,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Avatar,
    Badge,
    IconButton,
    Typography,
    Button,
    InputBase,
    Divider,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Tooltip,
    ListItemButton,
} from '@mui/material';
import {
    ConfirmationNumber as TicketsIcon,
    PeopleAlt as UsersIcon,
    Settings as SettingsIcon,
    Help as HelpIcon,
    Search as SearchIcon,
    Add as AddIcon,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    Logout as LogoutIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { setFilters, resetFilters, addTicket } from '../../redux/slices/ticketsSlice';
import { logout } from '../../redux/slices/authSlice';

const Sidebar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const { filters, selectedTicket } = useSelector((state) => state.tickets);
    const { token, user } = useSelector((state) => state.auth);

    const [isExpanded, setIsExpanded] = useState(true);
    const [searchInput, setSearchInput] = useState(filters.search || '');

    const isTicketsRoute = location.pathname.startsWith('/tickets');
    const isUsersRoute = location.pathname.startsWith('/users');

    const isAdmin = user?.type === 'admin';

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchInput !== filters.search) {
                dispatch(setFilters({ search: searchInput, page: 1 }));
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [searchInput, dispatch, filters.search]);

    useEffect(() => {
        if (filters.search !== searchInput) {
            setSearchInput(filters.search || '');
        }
    }, [filters.search]);

    const handleCategoryClick = (filter) => {
        dispatch(setFilters({ ...filter, page: 1 }));
    };


    const handleLogout = () => {
        toast("Are you sure you want to log out?", {
            action: {
                label: "Log out",
                onClick: () => {
                    dispatch(logout());
                    navigate('/login');
                    toast.success("Logged out successfully");
                }
            },
            cancel: {
                label: "Cancel"
            }
        });
    };

    const statusCategories = [
        { name: 'Unassigned', key: 'unassigned', filter: { unassigned: true, myTickets: false, status: null } },
        { name: 'Open', key: 'open', filter: { status: 'open', unassigned: false, myTickets: false } },
        { name: 'Pending', key: 'pending', filter: { status: 'pending', unassigned: false, myTickets: false } },
        { name: 'Solved', key: 'solved', filter: { status: 'solved', unassigned: false, myTickets: false } },
        { name: 'Spam', key: 'spam', filter: { status: 'spam', unassigned: false, myTickets: false } },
    ];

    const railItems = [
        { icon: <TicketsIcon />, label: 'Tickets', path: '/tickets', active: isTicketsRoute },
        isAdmin ? { icon: <UsersIcon />, label: 'Users', path: '/users', active: isUsersRoute } : null,
    ].filter(Boolean);

    return (
        <Box
            sx={{
                width: isExpanded ? 220 : 48,
                height: '100vh',
                bgcolor: '#0F172A',
                display: 'flex',
                flexDirection: 'column',
                transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                zIndex: 1201,
                backgroundImage: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)',
                borderRight: '1px solid rgba(255, 255, 255, 0.05)',
                overflowX: 'hidden',
                flexShrink: 0,
            }}
        >
            {/* Header / Logo */}
            <Box
                sx={{
                    p: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isExpanded ? 'flex-start' : 'center',
                    mb: 0.5
                }}
            >
                <Box
                    onClick={() => navigate('/')}
                    sx={{
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: '0.65rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 26,
                        minWidth: 26,
                        height: 26,
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        cursor: 'pointer',
                        background: 'linear-gradient(135deg, #0061FF 0%, #60EFFF 100%)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                        mr: isExpanded ? 1 : 0
                    }}
                >
                    HD
                </Box>

                {isExpanded && (
                    <Typography
                        variant="h6"
                        sx={{
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: "0.8rem",
                            whiteSpace: 'nowrap'
                        }}
                    >
                        HelpDesk
                    </Typography>
                )}
            </Box>

            {/* Nav Items */}
            <List sx={{ width: '100%', flexGrow: 1, px: 1 }}>
                {railItems.map((item) => (
                    <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                            onClick={() => navigate(item.path)}
                            sx={{
                                minHeight: 28,
                                justifyContent: isExpanded ? 'initial' : 'center',
                                px: 0.75,
                                borderRadius: '8px',
                                bgcolor: item.active ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                color: item.active ? '#ffffff' : '#94A3B8',
                                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.08)', color: '#ffffff' }
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    minWidth: 0,
                                    mr: isExpanded ? 1 : 'auto',
                                    justifyContent: 'center',
                                    color: 'inherit',
                                    '& svg': { fontSize: 18 }
                                }}
                            >
                                {item.active && item.label === 'Tickets' ? (
                                    <Badge
                                        variant="dot"
                                        color="error"
                                        sx={{ '& .MuiBadge-badge': { border: '2px solid #0F172A' } }}
                                    >
                                        {item.icon}
                                    </Badge>
                                ) : item.icon}
                            </ListItemIcon>

                            <ListItemText
                                primary={item.label}
                                sx={{
                                    opacity: isExpanded ? 1 : 0,
                                    '& .MuiTypography-root': {
                                        fontWeight: 600,
                                        fontSize: '0.75rem'
                                    }
                                }}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}

                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.05)', my: 1 }} />

                {/* Sub-menu for Tickets when expanded and no ticket is selected */}
                {isExpanded && isTicketsRoute && !selectedTicket && (
                    <Box sx={{ px: 0.5 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mb: 1,
                                px: 0.5
                            }}
                        >
                            <Typography
                                variant="overline"
                                sx={{
                                    color: '#64748B',
                                    fontWeight: 700,
                                    letterSpacing: '0.08em',
                                    fontSize: '0.6rem'
                                }}
                            >
                                FILTERS
                            </Typography>
                        </Box>

                        <Paper
                            elevation={0}
                            sx={{
                                p: '2px 8px',
                                display: 'flex',
                                alignItems: 'center',
                                bgcolor: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                mb: 1,
                                borderRadius: '8px',
                            }}
                        >
                            <SearchIcon sx={{ color: '#64748B', fontSize: 14 }} />

                            <InputBase
                                sx={{
                                    ml: 0.5,
                                    flex: 1,
                                    fontSize: '0.7rem',
                                    color: '#CBD5E1'
                                }}
                                placeholder="Search..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                            />
                        </Paper>

                        <List component="nav" sx={{ py: 0 }}>
                            <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.05)' }} />

                            {statusCategories.map((cat) => {
                                const isActive = cat.key === "unassigned" ? filters.unassigned : filters.status === cat.key;
                                return (
                                    <ListItemButton
                                        key={cat.key}
                                        onClick={() => handleCategoryClick(cat.filter)}
                                        sx={{
                                            borderRadius: '6px',
                                            mb: 0.25,
                                            px: 1,
                                            py: 0.4,
                                            bgcolor: isActive ? 'rgba(0, 97, 255, 0.15)' : 'transparent',
                                            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' }
                                        }}
                                    >
                                        <ListItemText
                                            primary={cat.name}
                                            primaryTypographyProps={{
                                                variant: 'body2',
                                                sx: {
                                                    fontWeight: isActive ? 700 : 500,
                                                    color: isActive ? '#fff' : '#94A3B8',
                                                    fontSize: '0.72rem'
                                                }
                                            }}
                                        />
                                    </ListItemButton>
                                );
                            })}

                            <ListItemButton
                                onClick={() => dispatch(setFilters({
                                    status: null,
                                    search: "",
                                    unassigned: false,
                                    myTickets: false,
                                }))}
                                sx={{
                                    borderRadius: '6px',
                                    px: 1,
                                    py: 0.4,
                                    bgcolor: (!filters.status && !filters.unassigned && !filters.myTickets)
                                        ? 'rgba(0, 97, 255, 0.15)'
                                        : 'transparent',
                                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' }
                                }}
                            >
                                <ListItemText
                                    primary="All tickets"
                                    primaryTypographyProps={{
                                        variant: 'body2',
                                        sx: {
                                            fontWeight: 700,
                                            color: (!filters.status && !filters.unassigned && !filters.myTickets)
                                                ? '#fff'
                                                : '#94A3B8',
                                            fontSize: '0.72rem'
                                        }
                                    }}
                                />
                            </ListItemButton>

                            <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.05)' }} />
                        </List>
                    </Box>
                )}
            </List>

            {/* Bottom Actions */}
            <List sx={{ width: '100%', px: 1, pb: 1 }}>
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                        onClick={handleLogout}
                        sx={{
                            minHeight: 30,
                            justifyContent: isExpanded ? 'initial' : 'center',
                            px: 1,
                            borderRadius: '8px',
                            color: '#EF4444',
                            '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' }
                        }}
                    >
                        <ListItemIcon
                            sx={{
                                minWidth: 0,
                                mr: isExpanded ? 1 : 'auto',
                                justifyContent: 'center',
                                color: 'inherit',
                                '& svg': { fontSize: 18 }
                            }}
                        >
                            <LogoutIcon />
                        </ListItemIcon>

                        <ListItemText
                            primary="Logout"
                            sx={{
                                opacity: isExpanded ? 1 : 0,
                                '& .MuiTypography-root': { fontSize: '0.75rem' }
                            }}
                        />
                    </ListItemButton>
                </ListItem>

                <ListItem disablePadding sx={{ mt: 0.5 }}>
                    <ListItemButton
                        sx={{
                            minHeight: 30,
                            justifyContent: isExpanded ? 'initial' : 'center',
                            px: 1,
                            borderRadius: '8px',
                        }}
                    >
                        <ListItemIcon
                            sx={{
                                minWidth: 0,
                                mr: isExpanded ? 1 : 'auto',
                                justifyContent: 'center'
                            }}
                        >
                            <Avatar
                                src={user?.avatar}
                                sx={{
                                    width: 24,
                                    height: 24,
                                    border: '2px solid #10B981',
                                    boxShadow: '0 0 6px rgba(16, 185, 129, 0.3)',
                                    fontSize: '0.65rem',
                                    fontWeight: 700,
                                }}
                            >
                                {user?.name?.[0].toUpperCase()}
                            </Avatar>
                        </ListItemIcon>

                        <ListItemText
                            primary={user?.name || "User"}
                            primaryTypographyProps={{
                                sx: {
                                    color: '#fff',
                                    fontWeight: 600,
                                    fontSize: '0.72rem'
                                }
                            }}
                            secondary={user?.type || "Role"}
                            secondaryTypographyProps={{
                                sx: {
                                    color: '#64748B',
                                    fontSize: '0.65rem'
                                }
                            }}
                            sx={{ opacity: isExpanded ? 1 : 0 }}
                        />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );
};

export default Sidebar;
