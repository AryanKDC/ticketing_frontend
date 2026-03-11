import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL + "/users";

export const registerUser = (data) => axios.post(API_URL, data);
export const loginUser = (data) => axios.post(`${API_URL}/login`, data);

export const getUsers = (token, params = {}) =>
    axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
        params,
    });

export const getUserById = (id, token) =>
    axios.get(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });

export const updateUser = (id, data, token) =>
    axios.put(`${API_URL}/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
    });

export const deleteUser = (id, token) =>
    axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });

export const changeUserRole = (id, role, token) =>
    axios.put(`${API_URL}/${id}/role`, { role }, {
        headers: { Authorization: `Bearer ${token}` },
    });