import api from './axios';

const getConfig = (token) => ({
    headers: {
        Authorization: `Bearer ${token}`,
    },
});

const notificationService = {
    // Admin methods
    sendNotification: async (notificationData, token) => {
        const response = await api.post('/admin/notifications', notificationData, getConfig(token));
        return response.data;
    },
    getAdminSentNotifications: async (token) => {
        const response = await api.get('/admin/notifications', getConfig(token));
        return response.data;
    },

    // Teacher methods
    sendClassNotification: async (notificationData, token) => {
        const response = await api.post('/teacher/notifications/class', notificationData, getConfig(token));
        return response.data;
    },
    sendStudentNotification: async (notificationData, token) => {
        const response = await api.post('/teacher/notifications/student', notificationData, getConfig(token));
        return response.data;
    },
    getTeacherSentNotifications: async (token) => {
        const response = await api.get('/teacher/notifications', getConfig(token));
        return response.data;
    },

    // User methods (Common)
    getMyNotifications: async (token) => {
        const response = await api.get('/users/notifications', getConfig(token));
        return response.data;
    },
    markAsRead: async (notificationId, token) => {
        const response = await api.put(`/users/notifications/${notificationId}/read`, {}, getConfig(token));
        return response.data;
    },
    deleteNotification: async (notificationId, token) => {
        const response = await api.delete(`/admin/notifications/${notificationId}`, getConfig(token));
        return response.data;
    },
    deleteTeacherNotification: async (notificationId, token) => {
        const response = await api.delete(`/teacher/notifications/${notificationId}`, getConfig(token));
        return response.data;
    }
};

export default notificationService;
