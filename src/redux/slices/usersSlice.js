import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getUsers, deleteUser, updateUser, changeUserRole } from "../../api/user";
import { toast } from 'sonner';

export const fetchUsers = createAsyncThunk(
    "users/fetchUsers",
    async ({ token, params = {} }, thunkAPI) => {
        try {
            const res = await getUsers(token, params);
            return res.data;
        } catch (err) {
            const message = err.response?.data?.error || "Failed to fetch users";
            toast.error(message);
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const removeUser = createAsyncThunk(
    "users/removeUser",
    async ({ id, token }, thunkAPI) => {
        try {
            await deleteUser(id, token);
            return id;
        } catch (err) {
            const message = err.response?.data?.error || "Failed to delete user";
            toast.error(message);
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const editUser = createAsyncThunk(
    "users/editUser",
    async ({ id, data, token }, thunkAPI) => {
        try {
            const res = await updateUser(id, data, token);
            return res.data.data;
        } catch (err) {
            const message = err.response?.data?.error || "Failed to update user";
            toast.error(message);
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const changeRole = createAsyncThunk(
    "users/changeRole",
    async ({ id, role, token }, thunkAPI) => {
        try {
            const res = await changeUserRole(id, role, token);
            toast.success("Role updated successfully!");
            return res.data.data;
        } catch (err) {
            const message = err.response?.data?.error || "Failed to change role";
            toast.error(message);
            return thunkAPI.rejectWithValue(message);
        }
    }
);

const usersSlice = createSlice({
    name: "users",
    initialState: {
        users: [],
        total: 0,
        pagination: {},
        loading: false,
        error: null,
    },
    reducers: {
        clearUsersError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload.data;
                state.pagination = action.payload.pagination || {};
                state.total = action.payload.pagination?.total || action.payload.total || action.payload.count || 0;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(removeUser.fulfilled, (state, action) => {
                state.users = state.users.filter((u) => u._id !== action.payload);
                state.total = Math.max(0, state.total - 1);
            })
            .addCase(removeUser.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(editUser.fulfilled, (state, action) => {
                state.users = state.users.map((u) =>
                    u._id === action.payload._id ? action.payload : u
                );
            })
            .addCase(editUser.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(changeRole.fulfilled, (state, action) => {
                state.users = state.users.map((u) =>
                    u._id === action.payload._id ? action.payload : u
                );
            })
            .addCase(changeRole.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export const { clearUsersError } = usersSlice.actions;
export default usersSlice.reducer;