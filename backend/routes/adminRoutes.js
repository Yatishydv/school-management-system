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
    getClasses,
    createClass,
    deleteClass,
    getSubjects,
    createSubject,
    deleteSubject,
    manageTimetable,
    getFeeRecords,
    recordPayment,
    getNotices,
    createNotice,
    deleteNotice,
    getGalleryImages,
    uploadGalleryImage,
    deleteGalleryImage,
} from '../controllers/adminController.js';

// All routes here require ADMIN role
router.use(protect);
router.use(authorize(['admin']));

// --- Dashboard ---
router.get('/dashboard', getDashboardStats);

// --- User Management ---
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.post('/users', addUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/reset-password', resetPassword);

// --- Class & Subject Management ---
router.get('/classes', getClasses);
router.post('/classes', createClass);
router.delete('/classes/:id', deleteClass);
router.get('/subjects', getSubjects);
router.post('/subjects', createSubject);
router.delete('/subjects/:id', deleteSubject);

// --- Timetable Management ---
router.post('/timetable', manageTimetable);

// --- Fees Management ---
router.get('/fees', getFeeRecords);
router.post('/fees/:id/payment', recordPayment);

// --- Notice/Event Management ---
router.get('/notices', getNotices);
router.post('/notices', createNotice);
router.delete('/notices/:id', deleteNotice);

// --- Gallery Management ---
router.get('/gallery', getGalleryImages);
router.post('/gallery', upload.single('image'), uploadGalleryImage);
router.delete('/gallery/:id', deleteGalleryImage);


export default router;