import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "sonner";
import { getTicketComments, addTicketComment } from "../../api/ticket";
import { deleteComment } from "../../api/comment";

// Fetch comments for a specific ticket
export const fetchComments = createAsyncThunk(
    "comments/fetchComments",
    async ({ ticketId, token }, thunkAPI) => {
        try {
            const res = await getTicketComments(ticketId, token);
            return res.data.data;
        } catch (err) {
            const message = err.response?.data?.error || "Failed to fetch comments";
            toast.error(message);
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Add a comment to a ticket
export const addComment = createAsyncThunk(
    "comments/addComment",
    async ({ ticketId, data, token }, thunkAPI) => {
        try {
            const res = await addTicketComment(ticketId, data, token);
            toast.success("Comment added!");
            return res.data.data;
        } catch (err) {
            const message = err.response?.data?.error || "Failed to add comment";
            toast.error(message);
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Delete a comment (admin only)
export const removeComment = createAsyncThunk(
    "comments/removeComment",
    async ({ id, token }, thunkAPI) => {
        try {
            await deleteComment(id, token);
            return id;
        } catch (err) {
            const message = err.response?.data?.error || "Failed to delete comment";
            toast.error(message);
            return thunkAPI.rejectWithValue(message);
        }
    }
);

const commentsSlice = createSlice({
    name: "comments",
    initialState: {
        comments: [],
        loading: false,
        error: null,
    },
    reducers: {
        clearComments: (state) => {
            state.comments = [];
        },
        clearCommentsError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Comments
            .addCase(fetchComments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchComments.fulfilled, (state, action) => {
                state.loading = false;
                state.comments = action.payload;
            })
            .addCase(fetchComments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Add Comment
            .addCase(addComment.pending, (state) => {
                state.error = null;
            })
            .addCase(addComment.fulfilled, (state, action) => {
                state.comments.push(action.payload);
            })
            .addCase(addComment.rejected, (state, action) => {
                state.error = action.payload;
            })

            // Remove Comment
            .addCase(removeComment.fulfilled, (state, action) => {
                state.comments = state.comments.filter((c) => c._id !== action.payload);
            })
            .addCase(removeComment.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export const { clearComments, clearCommentsError } = commentsSlice.actions;
export default commentsSlice.reducer;
