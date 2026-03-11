import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL + "/comments";

// Delete a comment (admin only)
export const deleteComment = (id, token) =>
    axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
