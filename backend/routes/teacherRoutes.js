import express from 'express';
const router = express.Router();
import { protect } from '../middlewares/authMiddleware.mjs';
import { authorize } from '../middlewares/rbacMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';
import { 
    getAssignedClasses, 
    getClassStudents, 
    createAssignment, 
    gradeSubmission,
    getAssignmentsForTeacher,
    getSubmissionsForAssignment
} from '../controllers/teacherController.js';

router.use(protect);
router.use(authorize(['teacher']));

// Class & Student Management
router.get('/classes', getAssignedClasses);
router.get('/classes/:classId/students', getClassStudents);

// Assignment Management
router.get('/assignments', getAssignmentsForTeacher);
router.get('/assignments/:assignmentId/submissions', getSubmissionsForAssignment);
router.post(
    '/assignments', 
    upload.single('file'), 
    createAssignment
);
router.put('/assignments/:assignmentId/grade', gradeSubmission);

// (Other routes for attendance, materials, etc. would go here)

export default router;