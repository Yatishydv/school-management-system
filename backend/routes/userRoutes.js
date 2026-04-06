import express from 'express';
const router = express.Router();
import { protect } from '../middlewares/authMiddleware.mjs';
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
router.put('/profile', upload.single('profileImage'), updateProfile);
router.put('/change-password', changePassword);

// Notifications
router.get('/notifications', getMyNotifications);
router.put('/notifications/:id/read', markAsRead);

export default router;
