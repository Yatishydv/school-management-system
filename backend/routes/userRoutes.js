import express from 'express';
const router = express.Router();
import { protect } from '../middlewares/authMiddleware.mjs';
import { getProfile, updateProfile, changePassword } from '../controllers/userController.js';
import upload from '../middlewares/uploadMiddleware.js';

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', upload.single('profileImage'), updateProfile);
router.put('/change-password', changePassword);

export default router;
