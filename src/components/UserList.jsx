import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Button, Table, TableHead, TableBody, TableRow, TableCell,
    TableContainer, CircularProgress, Alert, Box, Typography,
    Select, MenuItem, Chip, Pagination, TextField, InputAdornment,
    TableSortLabel, LinearProgress
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { fetchUsers, removeUser, changeRole } from "../redux/slices/usersSlice";
import { toast } from "sonner";

export default function UserList() {
    const dispatch = useDispatch();
    const { users, loading, error, pagination, total } = useSelector((state) => state.users);
    const { token, user: currentUser } = useSelector((state) => state.auth);

    const [filters, setFilters] = useState({
        search: "",
        sortBy: "name",
        order: "asc",
        page: 1,
        limit: 10,
    });

    const [searchInput, setSearchInput] = useState("");

    const isAdmin = currentUser?.type === 'admin';

    const loadUsers = useCallback(() => {
        if (token) {
            const params = {
                page: filters.page,
                limit: filters.limit,
                sort: filters.order === 'desc' ? `-${filters.sortBy}` : filters.sortBy,
            };
            if (filters.search) params.search = filters.search;

            dispatch(fetchUsers({ token, params }));
        }
    }, [dispatch, token, filters]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    // Handle debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
        }, 500);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const handleSearchChange = (e) => {
        setSearchInput(e.target.value);
    };

    const handleSort = (property) => {
        const isAsc = filters.sortBy === property && filters.order === 'asc';
        setFilters(prev => ({
            ...prev,
            order: isAsc ? 'desc' : 'asc',
            sortBy: property,
            page: 1
        }));
    };

    const handleDelete = (id) => {
        if (confirm("Delete this user?")) {
            dispatch(removeUser({ id, token })).unwrap()
                .then(() => {
                    loadUsers();
                })
                .catch((err) => {
                    const message = err.message || "Failed to delete user";
                    toast.error(message);
                });
        }
    };

    const handleRoleChange = (id, newType) => {
        dispatch(changeRole({ id, role: newType, token })).unwrap()
            .then(() => {
                loadUsers();
            })
            .catch((err) => {
                const message = err.message || "Failed to change role";
                toast.error(message);
            });
    };

    const handlePageChange = (event, page) => {
        setFilters(prev => ({ ...prev, page }));
    };

    if (error) return <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>;

    const roleColors = {
        admin: { bgcolor: '#EF444420', color: '#EF4444' },
        support: { bgcolor: '#3B82F620', color: '#3B82F6' },
        user: { bgcolor: '#10B98120', color: '#10B981' },
    };

    return (
        <Box sx={{ fontSize: '0.8rem' }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <TextField
                        placeholder="Search name or email..."
                        size="small"
                        value={searchInput}
                        onChange={handleSearchChange}
                        sx={{
                            width: 300,
                            '& .MuiInputBase-root': {
                                fontSize: '0.8rem',
                                bgcolor: 'white'
                            }
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ fontSize: '1rem', color: '#6b778c' }} />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" sx={{ color: '#6b778c', fontWeight: 500 }}>
                            Rows:
                        </Typography>
                        <Select
                            value={filters.limit}
                            onChange={(e) => setFilters(prev => ({ ...prev, limit: e.target.value, page: 1 }))}
                            size="small"
                            sx={{
                                height: 32,
                                fontSize: '0.75rem',
                                bgcolor: 'white',
                                '& .MuiSelect-select': { py: 0.5 }
                            }}
                        >
                            {[5, 10, 25, 50].map((val) => (
                                <MenuItem key={val} value={val} sx={{ fontSize: '0.75rem' }}>
                                    {val}
                                </MenuItem>
                            ))}
                        </Select>
                    </Box>
                </Box>
                <Typography variant="button" sx={{ color: '#6b778c', fontSize: '0.7rem', textTransform: 'none' }}>
                    Total Users: {total}
                </Typography>
            </Box>

            <TableContainer
                sx={{
                    border: '1px solid #dfe1e6',
                    borderRadius: '4px',
                    position: 'relative',
                    overflow: 'hidden',
                    bgcolor: 'white',
                    '& .MuiTableCell-root': {
                        py: 0.7,
                        px: 1.2
                    }
                }}
            >
                {loading && (
                    <LinearProgress
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 2,
                            zIndex: 1
                        }}
                    />
                )}
                <Table size="small">
                    <TableHead sx={{ bgcolor: '#f4f5f7' }}>
                        <TableRow>
                            <TableCell
                                sx={{
                                    fontWeight: 600,
                                    color: '#6b778c',
                                    fontSize: '0.7rem',
                                    letterSpacing: '0.03em'
                                }}
                            >
                                Sr. No
                            </TableCell>
                            <TableCell
                                sx={{
                                    fontWeight: 600,
                                    color: '#6b778c',
                                    fontSize: '0.7rem',
                                    letterSpacing: '0.03em'
                                }}
                            >
                                <TableSortLabel
                                    active={filters.sortBy === 'name'}
                                    direction={filters.sortBy === 'name' ? filters.order : 'asc'}
                                    onClick={() => handleSort('name')}
                                >
                                    NAME
                                </TableSortLabel>
                            </TableCell>
                            <TableCell
                                sx={{
                                    fontWeight: 600,
                                    color: '#6b778c',
                                    fontSize: '0.7rem',
                                    letterSpacing: '0.03em'
                                }}
                            >
                                <TableSortLabel
                                    active={filters.sortBy === 'email'}
                                    direction={filters.sortBy === 'email' ? filters.order : 'asc'}
                                    onClick={() => handleSort('email')}
                                >
                                    EMAIL
                                </TableSortLabel>
                            </TableCell>
                            <TableCell
                                sx={{
                                    fontWeight: 600,
                                    color: '#6b778c',
                                    fontSize: '0.7rem',
                                    letterSpacing: '0.03em'
                                }}
                            >
                                <TableSortLabel
                                    active={filters.sortBy === 'type'}
                                    direction={filters.sortBy === 'type' ? filters.order : 'asc'}
                                    onClick={() => handleSort('type')}
                                >
                                    ROLE
                                </TableSortLabel>
                            </TableCell>
                            {isAdmin && (
                                <TableCell
                                    align="right"
                                    sx={{
                                        fontWeight: 600,
                                        color: '#6b778c',
                                        fontSize: '0.7rem',
                                        letterSpacing: '0.03em'
                                    }}
                                >
                                    ACTIONS
                                </TableCell>
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((u, index) => {
                            const roleStyle = roleColors[u.type] || roleColors.user;
                            return (
                                <TableRow
                                    key={u._id}
                                    sx={{
                                        '&:hover': { bgcolor: '#f4f5f7' }
                                    }}
                                >
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                                            {(filters.page - 1) * filters.limit + index + 1}
                                        </Typography>
                                    </TableCell>

                                    <TableCell
                                        sx={{
                                            fontWeight: 500,
                                            color: '#172b4d',
                                            fontSize: '0.8rem'
                                        }}
                                    >
                                        {u.name}
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            color: '#42526e',
                                            fontSize: '0.75rem'
                                        }}
                                    >
                                        {u.email}
                                    </TableCell>
                                    <TableCell>
                                        {isAdmin ? (
                                            <Select
                                                value={u.type || 'user'}
                                                onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                                size="small"
                                                sx={{
                                                    fontSize: '0.72rem',
                                                    fontWeight: 700,
                                                    minWidth: 90,
                                                    height: 28,
                                                    borderRadius: '6px'
                                                }}
                                            >
                                                <MenuItem value="user">User</MenuItem>
                                                <MenuItem value="support">Support</MenuItem>
                                                <MenuItem value="admin">Admin</MenuItem>
                                            </Select>
                                        ) : (
                                            <Chip
                                                label={u.type || 'user'}
                                                size="small"
                                                sx={{
                                                    ...roleStyle,
                                                    fontWeight: 700,
                                                    textTransform: 'capitalize',
                                                    fontSize: '0.7rem',
                                                    height: 20,
                                                    px: 0.6
                                                }}
                                            />
                                        )}
                                    </TableCell>
                                    {isAdmin && (
                                        <TableCell align="right">
                                            <Button
                                                variant="text"
                                                color="error"
                                                size="small"
                                                onClick={() => handleDelete(u._id)}
                                                sx={{
                                                    fontWeight: 500,
                                                    fontSize: '0.72rem',
                                                    minWidth: 50,
                                                    px: 1
                                                }}
                                                disabled={u._id === currentUser?.id}
                                            >
                                                Delete
                                            </Button>
                                        </TableCell>
                                    )}
                                </TableRow>
                            );
                        })}
                        {users.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={isAdmin ? 4 : 3} align="center" sx={{ py: 3, color: '#6b778c' }}>
                                    No users found
                                </TableCell>
                            </TableRow>
                        )}
                        {users.length === 0 && loading && (
                            <TableRow>
                                <TableCell colSpan={isAdmin ? 4 : 3} align="center" sx={{ py: 5 }}>
                                    <CircularProgress size={24} />
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mt: 2,
                    px: 1
                }}
            >
                <Typography variant="caption" sx={{ color: '#6b778c' }}>
                    Showing {users.length > 0 ? (filters.page - 1) * filters.limit + 1 : 0} to {Math.min(filters.page * filters.limit, total)} of {total} users
                </Typography>
                {total > filters.limit && (
                    <Pagination
                        count={Math.ceil(total / filters.limit)}
                        page={filters.page}
                        onChange={handlePageChange}
                        size="small"
                        sx={{
                            '& .MuiPaginationItem-root': {
                                fontSize: '0.75rem',
                                minWidth: 26,
                                height: 26
                            }
                        }}
                    />
                )}
            </Box>
        </Box>
    );
}

