import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getTickets } from "../../api/ticket";
import { getUsers, updateUser, deleteUser } from "../../api/user";

// Fetch admin dashboard stats (ticket counts by status, total users, etc.)
export const fetchAdminStats = createAsyncThunk(
    "admin/fetchAdminStats",
    async (token, thunkAPI) => {
        try {
            // Fetch all tickets to compute stats (small limit per status for counts)
            const [allTickets, openTickets, pendingTickets, solvedTickets, unassignedTickets, usersRes] = await Promise.all([
                getTickets(token, { limit: 1 }),
                getTickets(token, { status: "open", limit: 1 }),
                getTickets(token, { status: "pending", limit: 1 }),
                getTickets(token, { status: "solved", limit: 1 }),
                getTickets(token, { unassigned: "true", limit: 1 }),
                getUsers(token, { limit: 1 }),
            ]);

            return {
                totalTickets: allTickets.data.total || 0,
                openTickets: openTickets.data.total || 0,
                pendingTickets: pendingTickets.data.total || 0,
                solvedTickets: solvedTickets.data.total || 0,
                unassignedTickets: unassignedTickets.data.total || 0,
                totalUsers: usersRes.data.count || 0,
            };
        } catch (err) {
            const message = err.response?.data?.error || "Failed to fetch admin stats";
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Fetch all users for admin panel (with pagination)
export const fetchAdminUsers = createAsyncThunk(
    "admin/fetchAdminUsers",
    async ({ token, params = {} }, thunkAPI) => {
        try {
            const res = await getUsers(token, params);
            return res.data;
        } catch (err) {
            const message = err.response?.data?.error || "Failed to fetch users";
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Update user role (admin only)
export const updateUserRole = createAsyncThunk(
    "admin/updateUserRole",
    async ({ id, data, token }, thunkAPI) => {
        try {
            const res = await updateUser(id, data, token);
            return res.data.data;
        } catch (err) {
            const message = err.response?.data?.error || "Failed to update user role";
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Remove user (admin only)
export const removeAdminUser = createAsyncThunk(
    "admin/removeAdminUser",
    async ({ id, token }, thunkAPI) => {
        try {
            await deleteUser(id, token);
            return id;
        } catch (err) {
            const message = err.response?.data?.error || "Failed to remove user";
            return thunkAPI.rejectWithValue(message);
        }
    }
);

const adminSlice = createSlice({
    name: "admin",
    initialState: {
        stats: {
            totalTickets: 0,
            openTickets: 0,
            pendingTickets: 0,
            solvedTickets: 0,
            unassignedTickets: 0,
            totalUsers: 0,
        },
        users: [],
        pagination: {},
        loading: false,
        statsLoading: false,
        error: null,
    },
    reducers: {
        clearAdminError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Admin Stats
            .addCase(fetchAdminStats.pending, (state) => {
                state.statsLoading = true;
                state.error = null;
            })
            .addCase(fetchAdminStats.fulfilled, (state, action) => {
                state.statsLoading = false;
                state.stats = action.payload;
            })
            .addCase(fetchAdminStats.rejected, (state, action) => {
                state.statsLoading = false;
                state.error = action.payload;
            })

            // Fetch Admin Users
            .addCase(fetchAdminUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAdminUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload.data;
                state.pagination = action.payload.pagination || {};
            })
            .addCase(fetchAdminUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(updateUserRole.fulfilled, (state, action) => {
                state.users = state.users.map((u) =>
                    u._id === action.payload._id ? action.payload : u
                );
            })
            .addCase(updateUserRole.rejected, (state, action) => {
                state.error = action.payload;
            })

            .addCase(removeAdminUser.fulfilled, (state, action) => {
                state.users = state.users.filter((u) => u._id !== action.payload);
            })
            .addCase(removeAdminUser.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
