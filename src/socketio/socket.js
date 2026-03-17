import { io } from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || "http://localhost:5000";

const socket = io(BACKEND_URL, {
    autoConnect: true,
    reconnection: true
});

socket.on("connect", () => {
    console.log("Connected to Socket.io:", socket.id);
});

socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error);
});

export default socket;