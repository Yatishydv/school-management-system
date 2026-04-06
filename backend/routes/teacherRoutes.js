import express from 'express';
const router = express.Router();
import { protect } from '../middlewares/authMiddleware.mjs';
import { authorize } from '../middlewares/rbacMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';
import { 
    getAssignedClasses, 
    getAssignedSubjects,
    getClassStudents, 
    createAssignment,
    updateAssignment,
    deleteAssignment,
    gradeSubmission,
    getAssignmentsForTeacher,
    getSubmissionsForAssignment,
    markAttendance,
    getAttendanceRecords,
    getHeadOfClassInfo,
    addResult,
    getTeacherResults,
    getDashboardSummary,
    getTeacherTimetable,
    sendClassNotification,
    sendStudentNotification,
    getTeacherSentNotifications,
    deleteTeacherNotification
} from '../controllers/teacherController.js';

router.use(protect);
router.use(authorize(['teacher']));

// Class & Student Management
router.get('/classes', getAssignedClasses);
router.get('/subjects', getAssignedSubjects);
router.get('/classes/:classId/students', getClassStudents);

// Assignment Management
router.get('/assignments', getAssignmentsForTeacher);
router.get('/assignments/:assignmentId/submissions', getSubmissionsForAssignment);
router.post(
    '/assignments', 
    upload.single('file'), 
    createAssignment
);
router.put(
    '/assignments/:assignmentId', 
    upload.single('file'), 
    updateAssignment
);
router.delete('/assignments/:assignmentId', deleteAssignment);
router.put('/assignments/:assignmentId/grade', gradeSubmission);

// Attendance Management
router.post('/attendance', markAttendance);
router.get('/attendance/:classId', getAttendanceRecords);
router.get('/attendance/:classId/head-info', getHeadOfClassInfo);

// Results Management
router.get('/results', getTeacherResults);
router.post('/results', addResult);

// Notification Management
router.get('/notifications', getTeacherSentNotifications);
router.post('/notifications/class', sendClassNotification);
router.post('/notifications/student', sendStudentNotification);
router.delete('/notifications/:id', deleteTeacherNotification);

// Dashboard & Timetable
router.get('/dashboard/summary', getDashboardSummary);
router.get('/timetable', getTeacherTimetable);

export default router;