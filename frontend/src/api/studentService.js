import axiosInstance from "./axios";

const getConfig = (token) => {
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

const getDashboardSummary = async (token) => {
    const response = await axiosInstance.get("/student/dashboard/summary", getConfig(token));
    return response.data;
};

const getTimetable = async (token) => {
    const response = await axiosInstance.get("/student/timetable", getConfig(token));
    return response.data;
};

const getAssignments = async (token) => {
    const response = await axiosInstance.get("/student/assignments", getConfig(token));
    return response.data;
};

const submitAssignment = async (assignmentId, formData, token) => {
    const response = await axiosInstance.post(`/student/assignments/${assignmentId}/submit`, formData, {
        headers: {
            ...getConfig(token).headers,
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};

const getFeeStatus = async (token) => {
    const response = await axiosInstance.get("/student/fees", getConfig(token));
    return response.data;
};

const getFees = async (token) => {
    return getFeeStatus(token);
};

const getNotices = async (token) => {
    const response = await axiosInstance.get("/student/notices", getConfig(token));
    return response.data;
};

const getAttendanceStats = async (token) => {
    const response = await axiosInstance.get("/student/attendance/stats", getConfig(token));
    return response.data;
};

const getAttendanceHistory = async (token) => {
    const response = await axiosInstance.get("/student/attendance/history", getConfig(token));
    return response.data;
};

const getRecentResults = async (token) => {
    const response = await axiosInstance.get("/student/results/recent", getConfig(token));
    return response.data;
};

const getAllResults = async (token) => {
    const response = await axiosInstance.get("/student/results", getConfig(token));
    return response.data;
};

const getProfile = async (token) => {
    const response = await axiosInstance.get("/student/profile", getConfig(token));
    return response.data;
};

const getSubjects = async (token) => {
    const response = await axiosInstance.get("/student/subjects", getConfig(token));
    return response.data;
};

const studentService = {
    getDashboardSummary,
    getTimetable,
    getAssignments,
    submitAssignment,
    getFeeStatus,
    getFees,
    getNotices,
    getAttendanceStats,
    getAttendanceHistory,
    getRecentResults,
    getAllResults,
    getProfile,
    getSubjects,
};

export default studentService;
