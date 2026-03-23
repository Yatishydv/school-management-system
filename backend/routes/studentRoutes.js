import express from 'express';
const router = express.Router();
import { protect } from '../middlewares/authMiddleware.mjs';
import { authorize } from '../middlewares/rbacMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';
import { 
    getTimetable, 
    getAssignments, 
    submitAssignment, 
    getFeeStatus,
    getNotices
} from '../controllers/studentController.js';

router.use(protect);
router.use(authorize(['student']));

// Timetable
router.get('/timetable', getTimetable);

// Assignments
router.get('/assignments', getAssignments);
router.post(
    '/assignments/:assignmentId/submit', 
    upload.single('assignmentFile'), 
    submitAssignment
);

// Fees
router.get('/fees', getFeeStatus);

//Notices
router.get('/notices', getNotices);

// (Other routes for marks, attendance, etc. would go here)

export default router;