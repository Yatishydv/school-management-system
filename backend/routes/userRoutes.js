import express from 'express';
const router = express.Router();
import { protect, authorize } from '../middlewares/authMiddleware.mjs';
import { 
    getProfile, 
    updateProfile, 
    changePassword, 
    getMyNotifications, 
    markAsRead 
} from '../controllers/userController.js';
import upload from '../middlewares/uploadMiddleware.js';

router.use(protect);

router.get('/profile', getProfile);

// Lockdown: Only Admin can update profiles or change passwords per user request
router.put('/profile', authorize('admin'), upload.single('profileImage'), updateProfile);
router.put('/change-password', authorize('admin'), changePassword);

// Notifications
router.get('/notifications', getMyNotifications);
router.put('/notifications/:id/read', markAsRead);

export default router;
