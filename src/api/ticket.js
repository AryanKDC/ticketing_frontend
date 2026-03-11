import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL + "/tickets";

// Create a new ticket
export const createTicket = (data, token) =>
    axios.post(API_URL, data, {
        headers: { Authorization: `Bearer ${token}` },
    });

// Get all tickets (with optional query params)
export const getTickets = (token, params = {}) =>
    axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
        params,
    });

// Get a single ticket by ID
export const getTicketById = (id, token) =>
    axios.get(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });

// Update a ticket by ID
export const updateTicket = (id, data, token) =>
    axios.put(`${API_URL}/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
    });

// Delete a ticket by ID
export const deleteTicket = (id, token) =>
    axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });

// Get comments for a specific ticket
export const getTicketComments = (ticketId, token) =>
    axios.get(`${API_URL}/${ticketId}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
    });

// Add a comment to a specific ticket
export const addTicketComment = (ticketId, data, token) =>
    axios.post(`${API_URL}/${ticketId}/comments`, data, {
        headers: { Authorization: `Bearer ${token}` },
    });