import express from 'express';
const router = express.Router();
import { loginUser, registerAdmin, getMe } 
from '../controllers/authController.js';

import { protect } from '../middlewares/authMiddleware.mjs';

// Public routes
router.post('/login', loginUser);
// router.post('/forgot-password', forgotPassword);

// Initial setup route (usually disabled after first admin creation)
router.post('/register-admin', registerAdmin);

// Private routes
router.get('/me', protect, getMe);

export default router;