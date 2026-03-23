// frontend/src/api/adminService.js

import axios from "axios";

// Correct backend API URL
const API_URL = "http://localhost:5005/api/admin";

// Auto attach baseURL for convenience
const axiosInstance = axios.create({
    baseURL: API_URL,
});

// Function to set authorization header
const getConfig = (token) => {
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

// Get all users (students and teachers)
const getUsers = async (roleFilter, token) => {
    const response = await axiosInstance.get(`/users`, { 
        params: { role: roleFilter },
        ...getConfig(token)
    });
    return response.data;
};

// Add a new user (student or teacher)
const addUser = async (userData, token) => {
    const response = await axiosInstance.post(`/users`, userData, getConfig(token));
    return response.data;
};

// Update an existing user
const updateUser = async (userId, userData, token) => {
    const response = await axiosInstance.put(`/users/${userId}`, userData, getConfig(token));
    return response.data;
};

// Delete a user
const deleteUser = async (userId, token) => {
    const response = await axiosInstance.delete(`/users/${userId}`, getConfig(token));
    return response.data;
};

// Reset user password
const resetUserPassword = async (userId, token) => {
    const response = await axiosInstance.put(`/users/${userId}/reset-password`, {}, getConfig(token));
    return response.data;
};

// Get dashboard stats
const getDashboardStats = async (token) => {
    const response = await axiosInstance.get(`/dashboard`, getConfig(token));
    return response.data;
};

// Get all classes
const getClasses = async (token) => {
    const response = await axiosInstance.get(`/classes`, getConfig(token));
    return response.data;
};

const adminService = {
    getUsers,
    addUser,
    updateUser,
    deleteUser,
    resetUserPassword,
    getDashboardStats,
    getClasses,
};

export default adminService;
