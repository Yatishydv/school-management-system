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
    getNotices,
    getStudentProfile,
    getStudentSubjects,
    getAttendanceStats,
    getAttendanceHistory,
    getRecentResults,
    getResults,
    getDashboardSummary
} from '../controllers/studentController.js';

router.use(protect);
router.use(authorize(['student']));

// Profile
router.get('/profile', getStudentProfile);

// Subjects
router.get('/subjects', getStudentSubjects);

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

// Attendance
router.get('/attendance/stats', getAttendanceStats);
router.get('/attendance/history', getAttendanceHistory);

// Results
router.get('/results', getResults);
router.get('/results/recent', getRecentResults);

// Dashboard Summary
router.get('/dashboard/summary', getDashboardSummary);

export default router;