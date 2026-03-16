import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getTickets, createTicket, updateTicket, deleteTicket, getTicketById } from "../../api/ticket";

// Fetch all tickets (with filters/pagination)
export const fetchTickets = createAsyncThunk(
    "tickets/fetchTickets",
    async ({ token, params }, thunkAPI) => {
        try {
            const res = await getTickets(token, params);
            return res.data;
        } catch (err) {
            const message = err.response?.data?.error || "Failed to fetch tickets";
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Fetch a single ticket by ID (with populated comments)
export const fetchTicketById = createAsyncThunk(
    "tickets/fetchTicketById",
    async ({ id, token }, thunkAPI) => {
        try {
            const res = await getTicketById(id, token);
            return res.data.data;
        } catch (err) {
            const message = err.response?.data?.error || "Failed to fetch ticket";
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Create a new ticket
export const addTicket = createAsyncThunk(
    "tickets/addTicket",
    async ({ data, token }, thunkAPI) => {
        try {
            const res = await createTicket(data, token);

            return res.data.data;
        } catch (err) {
            const message = err.response?.data?.error || "Failed to create ticket";
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Update a ticket
export const editTicket = createAsyncThunk(
    "tickets/editTicket",
    async ({ id, data, token }, thunkAPI) => {
        try {
            const res = await updateTicket(id, data, token);

            return res.data.data;
        } catch (err) {
            const message = err.response?.data?.error || "Failed to update ticket";
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Delete a ticket
export const removeTicket = createAsyncThunk(
    "tickets/removeTicket",
    async ({ id, token }, thunkAPI) => {
        try {
            await deleteTicket(id, token);

            return id;
        } catch (err) {
            const message = err.response?.data?.error || "Failed to delete ticket";
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Assign ticket
export const assignTicket = createAsyncThunk(
    "tickets/assignTicket",
    async ({ id, data, token }, thunkAPI) => {
        try {
            const res = await updateTicket(id, data, token);

            return res.data.data;
        } catch (err) {
            const message = err.response?.data?.error || "Failed to assign ticket";
            return thunkAPI.rejectWithValue(message);
        }
    }
)

const ticketSlice = createSlice({
    name: "tickets",
    initialState: {
        tickets: [],
        selectedTicket: null,
        total: 0,
        loading: false,
        error: null,
        pagination: {},
        filters: {
            status: null,
            search: "",
            unassigned: false,
            myTickets: false,
            page: 1,
            limit: 10,
            sortBy: 'updatedAt',
            order: 'desc',
        },
    },
    reducers: {
        clearSelectedTicket: (state) => {
            state.selectedTicket = null;
        },
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        resetFilters: (state) => {
            state.filters = {
                status: null,
                search: "",
                unassigned: false,
                myTickets: false,
                page: 1,
                limit: 5,
                sortBy: 'createdAt',
                order: 'desc',
            };
        },
        clearTicketError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Tickets
            .addCase(fetchTickets.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTickets.fulfilled, (state, action) => {
                state.loading = false;
                state.tickets = action.payload.data;
                state.pagination = action.payload.pagination || {};
                state.total = action.payload.pagination?.total || action.payload.total || 0;
            })
            .addCase(fetchTickets.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch Single Ticket
            .addCase(fetchTicketById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTicketById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedTicket = action.payload;
            })
            .addCase(fetchTicketById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Add Ticket
            .addCase(addTicket.fulfilled, (state, action) => {
                state.tickets.unshift(action.payload);
                state.total += 1;
            })
            .addCase(addTicket.rejected, (state, action) => {
                state.error = action.payload;
            })

            // Edit Ticket
            .addCase(editTicket.fulfilled, (state, action) => {
                state.tickets = state.tickets.map((t) =>
                    t._id === action.payload._id ? action.payload : t
                );
                if (state.selectedTicket && state.selectedTicket._id === action.payload._id) {
                    state.selectedTicket = action.payload;
                }
            })
            .addCase(editTicket.rejected, (state, action) => {
                state.error = action.payload;
            })

            // Remove Ticket
            .addCase(removeTicket.fulfilled, (state, action) => {
                state.tickets = state.tickets.filter((t) => t._id !== action.payload);
                state.total = Math.max(0, state.total - 1);
                if (state.selectedTicket && state.selectedTicket._id === action.payload) {
                    state.selectedTicket = null;
                }
            })
            .addCase(removeTicket.rejected, (state, action) => {
                state.error = action.payload;
            })

            // Assign Ticket
            .addCase(assignTicket.fulfilled, (state, action) => {
                state.tickets = state.tickets.map((t) =>
                    t._id === action.payload._id ? action.payload : t
                );
                if (state.selectedTicket && state.selectedTicket._id === action.payload._id) {
                    state.selectedTicket = action.payload;
                }
            })
            .addCase(assignTicket.rejected, (state, action) => {
                state.error = action.payload;
            })
    },
});

export const { clearSelectedTicket, setFilters, resetFilters, clearTicketError } = ticketSlice.actions;
export default ticketSlice.reducer;