import express from 'express';
const router = express.Router();
import { protect } from '../middlewares/authMiddleware.mjs';
import { authorize } from '../middlewares/rbacMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';
import {
    getDashboardStats,
    getUsers,
    getUserById,
    addUser,
    updateUser,
    deleteUser,
    resetPassword,
    enrollStudents,
    getClasses,
    getClassDetails,
    createClass,
    updateClass,
    deleteClass,
    getSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
    manageTimetable,
    getTimetable,
    getExams,
    createExam,
    deleteExam,
    createFee,
    getFeeRecords,
    recordPayment,
    updateFee,
    deleteFee,
    deleteFeesBulk,
    getNotices,
    createNotice,
    deleteNotice,
    getGalleryImages,
    uploadGalleryImage,
    deleteGalleryImage,
    addUsersBulk,
    addClassesBulk,
    addSubjectsBulk,
    sendNotification,
    getSentNotifications,
    deleteNotification
} from '../controllers/adminController.js';
import { getSettings, updateSettings, uploadSiteMedia } from '../controllers/settingsController.js';

// All routes here require ADMIN role
router.use(protect);
router.use(authorize(['admin']));

// --- Dashboard ---
router.get('/dashboard', getDashboardStats);

// --- User Management ---
router.get('/users', getUsers);
router.post('/users/bulk', addUsersBulk);
router.post('/users/enroll', enrollStudents);
router.get('/users/:id', getUserById);
router.post('/users', upload.single('profileImage'), addUser);
router.put('/users/:id', upload.single('profileImage'), updateUser);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/reset-password', resetPassword);

// --- Class & Subject Management ---
router.get('/classes', getClasses);
router.post('/classes/bulk', addClassesBulk);
router.get('/classes/:id/details', getClassDetails);
router.post('/classes', createClass);
router.put('/classes/:id', updateClass);
router.delete('/classes/:id', deleteClass);
router.get('/subjects', getSubjects);
router.post('/subjects/bulk', addSubjectsBulk);
router.post('/subjects', createSubject);
router.put('/subjects/:id', updateSubject);
router.delete('/subjects/:id', deleteSubject);

// --- Timetable Management ---
router.get('/timetable/:classId', getTimetable);
router.post('/timetable', manageTimetable);

// --- Examination Hub ---
router.get('/exams', getExams);
router.post('/exams', createExam);
router.delete('/exams/:id', deleteExam);

// --- Fees Management ---
router.get('/fees', getFeeRecords);
router.post('/fees', createFee);
router.put('/fees/:id', updateFee);
router.delete('/fees/:id', deleteFee);
router.post('/fees/bulk-delete', deleteFeesBulk);
router.post('/fees/:id/payment', recordPayment);

// --- Notice/Event Management ---
router.get('/notices', getNotices);
router.post('/notices', createNotice);
router.delete('/notices/:id', deleteNotice);

// --- Notification Management ---
router.get('/notifications', getSentNotifications);
router.post('/notifications', sendNotification);
router.delete('/notifications/:id', deleteNotification);

// --- Gallery Management ---
router.get('/gallery', getGalleryImages);
router.post('/gallery', upload.single('image'), uploadGalleryImage);
router.delete('/gallery/:id', deleteGalleryImage);

// --- Site Customization Engine ---
router.get('/settings', getSettings);
router.put('/settings', updateSettings);
router.post('/settings/upload', upload.single('image'), uploadSiteMedia);


export default router;