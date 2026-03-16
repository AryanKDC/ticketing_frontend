import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginUser, registerUser } from "../../api/user";

// Load persisted auth from localStorage
const tokenFromStorage = localStorage.getItem("token");
const userFromStorage = JSON.parse(localStorage.getItem("user") || "null");

export const login = createAsyncThunk("auth/login", async (data, thunkAPI) => {
    try {
        const res = await loginUser(data);
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        return res.data;
    } catch (err) {
        const message = err.response?.data?.error || "Login failed";
        return thunkAPI.rejectWithValue(message);
    }
});

export const register = createAsyncThunk("auth/register", async (data, thunkAPI) => {
    try {
        const res = await registerUser(data);
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.data));

        return res.data;
    } catch (err) {
        const message = err.response?.data?.message || err.response?.data?.error || "Registration failed";
        return thunkAPI.rejectWithValue(message);
    }
});

const authSlice = createSlice({
    name: "auth",
    initialState: {
        token: tokenFromStorage || null,
        user: userFromStorage || null,
        loading: false,
        error: null,
    },
    reducers: {
        logout: (state) => {
            state.token = null;
            state.user = null;
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        },
        clearAuthError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.token;
                state.user = action.payload.user;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.token;
                state.user = action.payload.data;
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;