import axiosInstance from "./axios";

const getConfig = (token) => {
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

const getUsers = async (roleFilter, token) => {
    const response = await axiosInstance.get(`/admin/users`, { 
        params: { role: roleFilter },
        ...getConfig(token)
    });
    return response.data;
};

const addUser = async (userData, token) => {
    const isFormData = userData instanceof FormData;
    const response = await axiosInstance.post(`/admin/users`, userData, {
        ...getConfig(token),
        headers: {
            ...getConfig(token).headers,
            ...(isFormData ? {} : { "Content-Type": "application/json" }),
        },
    });
    return response.data;
};

const updateUser = async (userId, userData, token) => {
    const isFormData = userData instanceof FormData;
    const response = await axiosInstance.put(`/admin/users/${userId}`, userData, {
        ...getConfig(token),
        headers: {
            ...getConfig(token).headers,
            ...(isFormData ? {} : { "Content-Type": "application/json" }),
        },
    });
    return response.data;
};

const deleteUser = async (userId, token) => {
    const response = await axiosInstance.delete(`/admin/users/${userId}`, getConfig(token));
    return response.data;
};

const resetUserPassword = async (userId, token) => {
    const response = await axiosInstance.put(`/admin/users/${userId}/reset-password`, {}, getConfig(token));
    return response.data;
};

const getDashboardStats = async (token) => {
    const response = await axiosInstance.get(`/admin/dashboard`, getConfig(token));
    return response.data;
};

const getClasses = async (token) => {
    const response = await axiosInstance.get(`/admin/classes`, getConfig(token));
    return response.data;
};

const createClass = async (classData, token) => {
    const response = await axiosInstance.post(`/admin/classes`, classData, getConfig(token));
    return response.data;
};

const updateClass = async (classId, classData, token) => {
    const response = await axiosInstance.put(`/admin/classes/${classId}`, classData, getConfig(token));
    return response.data;
};

const deleteClass = async (classId, token) => {
    const response = await axiosInstance.delete(`/admin/classes/${classId}`, getConfig(token));
    return response.data;
};

const getSubjects = async (token) => {
    const response = await axiosInstance.get(`/admin/subjects`, getConfig(token));
    return response.data;
};

const addSubject = async (subjectData, token) => {
    const response = await axiosInstance.post(`/admin/subjects`, subjectData, getConfig(token));
    return response.data;
};

const updateSubject = async (subjectId, subjectData, token) => {
    const response = await axiosInstance.put(`/admin/subjects/${subjectId}`, subjectData, getConfig(token));
    return response.data;
};

const deleteSubject = async (subjectId, token) => {
    const response = await axiosInstance.delete(`/admin/subjects/${subjectId}`, getConfig(token));
    return response.data;
};

const getClassDetails = async (classId, token) => {
    const response = await axiosInstance.get(`/admin/classes/${classId}/details`, getConfig(token));
    return response.data;
};

const getGalleryImages = async (token) => {
    const response = await axiosInstance.get(`/admin/gallery`, getConfig(token));
    return response.data;
};

const uploadGalleryImage = async (formData, token) => {
    const response = await axiosInstance.post(`/admin/gallery`, formData, {
        ...getConfig(token),
        headers: {
            ...getConfig(token).headers,
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};

const deleteGalleryImage = async (id, token) => {
    const response = await axiosInstance.delete(`/admin/gallery/${id}`, getConfig(token));
    return response.data;
};

const bulkAddUsers = async (payload, token) => {
    const response = await axiosInstance.post(`/admin/users/bulk`, payload, getConfig(token));
    return response.data;
};

const bulkAddClasses = async (payload, token) => {
    const response = await axiosInstance.post(`/admin/classes/bulk`, payload, getConfig(token));
    return response.data;
};

const bulkAddSubjects = async (payload, token) => {
    const response = await axiosInstance.post(`/admin/subjects/bulk`, payload, getConfig(token));
    return response.data;
};

const adminService = {
    getUsers,
    addUser,
    bulkAddUsers,
    updateUser,
    deleteUser,
    resetUserPassword,
    getDashboardStats,
    getClasses,
    getClassDetails,
    createClass,
    bulkAddClasses,
    updateClass,
    deleteClass,
    getSubjects,
    addSubject,
    bulkAddSubjects,
    updateSubject,
    deleteSubject,
    getGalleryImages,
    uploadGalleryImage,
    deleteGalleryImage,
    enrollStudents: async (payload, token) => {
        const response = await axiosInstance.post(`/admin/users/enroll`, payload, getConfig(token));
        return response.data;
    },
    getTimetable: async (classId, token) => {
        const response = await axiosInstance.get(`/admin/timetable/${classId}`, getConfig(token));
        return response.data;
    },
    manageTimetable: async (timetableData, token) => {
        const response = await axiosInstance.post(`/admin/timetable`, timetableData, getConfig(token));
        return response.data;
    },
    getExams: async (token) => {
        const response = await axiosInstance.get(`/admin/exams`, getConfig(token));
        return response.data;
    },
    createExam: async (examData, token) => {
        const response = await axiosInstance.post(`/admin/exams`, examData, getConfig(token));
        return response.data;
    },
    deleteExam: async (examId, token) => {
        const response = await axiosInstance.delete(`/admin/exams/${examId}`, getConfig(token));
        return response.data;
    },
    getFees: async (token) => {
        const response = await axiosInstance.get(`/admin/fees`, getConfig(token));
        return response.data;
    },
    createFee: async (feeData, token) => {
        const response = await axiosInstance.post(`/admin/fees`, feeData, getConfig(token));
        return response.data;
    },
    recordPayment: async (feeId, paymentData, token) => {
        const response = await axiosInstance.post(`/admin/fees/${feeId}/payment`, paymentData, getConfig(token));
        return response.data;
    },
    updateFee: async (feeId, feeData, token) => {
        const response = await axiosInstance.put(`/admin/fees/${feeId}`, feeData, getConfig(token));
        return response.data;
    },
    deleteFee: async (feeId, token) => {
        const response = await axiosInstance.delete(`/admin/fees/${feeId}`, getConfig(token));
        return response.data;
    },
    deleteFeesBulk: async (feeIds, token) => {
        const response = await axiosInstance.post(`/admin/fees/bulk-delete`, { feeIds }, getConfig(token));
        return response.data;
    },
    getNotices: async (token) => {
        const response = await axiosInstance.get(`/admin/notices`, getConfig(token));
        return response.data;
    },
    createNotice: async (noticeData, token) => {
        const response = await axiosInstance.post(`/admin/notices`, noticeData, getConfig(token));
        return response.data;
    },
    deleteNotice: async (noticeId, token) => {
        const response = await axiosInstance.delete(`/admin/notices/${noticeId}`, getConfig(token));
        return response.data;
    },
    getNotifications: async (token) => {
        const response = await axiosInstance.get(`/admin/notifications`, getConfig(token));
        return response.data;
    },
    sendNotification: async (notifData, token) => {
        const response = await axiosInstance.post(`/admin/notifications`, notifData, getConfig(token));
        return response.data;
    },
    deleteNotification: async (notifId, token) => {
        const response = await axiosInstance.delete(`/admin/notifications/${notifId}`, getConfig(token));
        return response.data;
    },
};

export default adminService;
