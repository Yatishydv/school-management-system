import express from 'express';
const router = express.Router();
import { 
    getPublicNotices, 
    getGallery, 
    getPublicTeachers,
    getSchoolStats
} from '../controllers/publicController.js';

// Routes for the public-facing website (no auth required)
router.get('/notices', getPublicNotices);
router.get('/gallery', getGallery);
router.get('/teachers', getPublicTeachers);
router.get('/stats', getSchoolStats);

// Add an admissions form submission route here if needed

export default router;