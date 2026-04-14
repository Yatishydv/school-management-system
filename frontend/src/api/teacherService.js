import axiosInstance from "./axios";

const getConfig = (token) => {
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

const getProfile = async (token) => {
    // Shared profile endpoint in userRoutes.js usually
    const response = await axiosInstance.get("/users/profile", getConfig(token));
    return response.data;
};

const getAssignedSubjects = async (token) => {
    const response = await axiosInstance.get("/teacher/subjects", getConfig(token));
    return response.data;
};

const getAssignedClasses = async (token) => {
    const response = await axiosInstance.get("/teacher/classes", getConfig(token));
    return response.data;
};

const getClassStudents = async (classId, token) => {
    const response = await axiosInstance.get(`/teacher/classes/${classId}/students`, getConfig(token));
    return response.data;
};

const markAttendance = async (attendanceData, token) => {
    const response = await axiosInstance.post("/teacher/attendance", attendanceData, getConfig(token));
    return response.data;
};

const getAttendanceRecords = async (classId, date, token) => {
    const response = await axiosInstance.get(`/teacher/attendance/${classId}`, {
        params: { date },
        ...getConfig(token)
    });
    return response.data;
};

const getHeadOfClassInfo = async (classId, date, token) => {
    const response = await axiosInstance.get(`/teacher/attendance/${classId}/head-info`, {
        params: { date },
        ...getConfig(token)
    });
    return response.data;
};

const addResult = async (resultData, token) => {
    const response = await axiosInstance.post("/teacher/results", resultData, getConfig(token));
    return response.data;
};

const teacherService = {
    getProfile,
    getAssignedSubjects,
    getAssignedClasses,
    getClassStudents,
    markAttendance,
    getAttendanceRecords,
    getHeadOfClassInfo,
    addResult,
    getDashboardSummary: async (token) => {
        const response = await axiosInstance.get("/teacher/dashboard/summary", getConfig(token));
        return response.data;
    },
    getTimetable: async (token) => {
        const response = await axiosInstance.get("/teacher/timetable", getConfig(token));
        return response.data;
    },
    getAssignments: async (token) => {
        const response = await axiosInstance.get("/teacher/assignments", getConfig(token));
        return response.data;
    },
    createAssignment: async (formData, token) => {
        const response = await axiosInstance.post("/teacher/assignments", formData, {
            headers: {
                ...getConfig(token).headers,
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },
    getSubmissions: async (assignmentId, token) => {
        const response = await axiosInstance.get(`/teacher/assignments/${assignmentId}/submissions`, getConfig(token));
        return response.data;
    },
    gradeSubmission: async (assignmentId, gradeData, token) => {
        const response = await axiosInstance.put(`/teacher/assignments/${assignmentId}/grade`, gradeData, getConfig(token));
        return response.data;
    },
    updateAssignment: async (assignmentId, formData, token) => {
        const response = await axiosInstance.put(`/teacher/assignments/${assignmentId}`, formData, {
            headers: {
                ...getConfig(token).headers,
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },
    deleteAssignment: async (assignmentId, token) => {
        const response = await axiosInstance.delete(`/teacher/assignments/${assignmentId}`, getConfig(token));
        return response.data;
    },
    getResults: async (token) => {
        const response = await axiosInstance.get("/teacher/results", getConfig(token));
        return response.data;
    },
    getNotices: async () => {
        const response = await axiosInstance.get("/public/notices");
        return response.data;
    },
};

export default teacherService;
