import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.js";
import usersReducer from "./slices/usersSlice.js";
import ticketsReducer from "./slices/ticketsSlice.js";
import commentsReducer from "./slices/commentsSlice.js";
import adminReducer from "./slices/adminSlice.js";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        users: usersReducer,
        tickets: ticketsReducer,
        comments: commentsReducer,
        admin: adminReducer,
    },
});