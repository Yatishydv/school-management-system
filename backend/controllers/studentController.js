import Assignment from '../models/Assignment.js';
import Timetable from '../models/Timetable.js';
import Fee from '../models/Fee.js';
import Notice from '../models/Notice.js';
import Subject from '../models/Subject.js';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import Result from '../models/Result.js';

// @desc    Get student's timetable
// @route   GET /api/student/timetable
// @access  Private (Student)
const getTimetable = async (req, res) => {
    try {
        const studentClassId = req.user.classId;

        const timetable = await Timetable.findOne({ class: studentClassId })
            .populate({
                path: 'schedule.subject',
                select: 'name code'
            })
            .populate({
                path: 'schedule.teacher',
                select: 'name uniqueId'
            });

        if (!timetable) {
            return res.status(200).json([]);
        }

        res.status(200).json(timetable.schedule);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching timetable.' });
    }
};

// @desc    Get all assignments for the student's class
// @route   GET /api/student/assignments
// @access  Private (Student)
const getAssignments = async (req, res) => {
    try {
        const studentClassId = req.user.classId;
        
        const assignments = await Assignment.find({ class: studentClassId })
            .populate('subject', 'name code')
            .select('title description dueDate submissions file');

        // Filter submissions to only include the current student's record
        const assignmentsWithStatus = assignments.map(assignment => {
            const submission = assignment.submissions.find(sub => sub.student.toString() === req.user._id.toString());
            
            return {
                _id: assignment._id,
                title: assignment.title,
                description: assignment.description,
                dueDate: assignment.dueDate,
                subject: assignment.subject,
                file: assignment.file,
                status: submission ? (submission.grade !== null ? 'Graded' : 'Submitted') : 'Pending',
                submissionDetails: submission || null,
            };
        });

        res.status(200).json(assignmentsWithStatus);

    } catch (error) {
        res.status(500).json({ message: 'Error fetching assignments.' });
    }
};

// @desc    Submit an assignment
// @route   POST /api/student/assignments/:assignmentId/submit
// @access  Private (Student)
const submitAssignment = async (req, res) => {
    const { assignmentId } = req.params;
    const studentId = req.user._id;

    try {
        const assignment = await Assignment.findById(assignmentId);

        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found.' });
        }

        // Check if the student has already submitted
        const existingSubmission = assignment.submissions.find(
            (sub) => sub.student.toString() === studentId.toString()
        );

        if (existingSubmission) {
            return res.status(400).json({ message: 'You have already submitted this assignment.' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        const newSubmission = {
            student: studentId,
            file: req.file.path, // Save the path of the uploaded file
            submittedAt: new Date(),
        };

        assignment.submissions.push(newSubmission);
        await assignment.save();

        res.status(201).json({ message: 'Assignment submitted successfully.' });

    } catch (error) {
        res.status(500).json({ message: 'Error submitting assignment.' });
    }
};

// @desc    Get student's fee status
// @route   GET /api/student/fees
// @access  Private (Student)
const getFeeStatus = async (req, res) => {
    try {
        const feeStatus = await Fee.find({ student: req.user._id })
            .sort({ dueDate: 1 });
        
        res.status(200).json(feeStatus);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching fee status.' });
    }
};

// @desc    Get all notices for the student's class
// @route   GET /api/student/notices
// @access  Private (Student)
const getNotices = async (req, res) => {
    try {
        const studentClassId = req.user.classId;
        
        const notices = await Notice.find({ 
            $or: [
                { target: 'all' },
                { target: 'students' },
                { target: 'class', targetClass: studentClassId }
            ]
        }).sort({ date: -1 });

        res.status(200).json(notices);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notices.' });
    }
};

// @desc    Get student's profile
// @route   GET /api/student/profile
// @access  Private (Student)
const getStudentProfile = async (req, res) => {
    try {
        const student = await User.findById(req.user._id)
            .populate('classId', 'name stream')
            .select('-password');
            
        if (!student) {
            return res.status(404).json({ message: 'Student not found.' });
        }
        res.status(200).json(student);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile.' });
    }
};

// @desc    Get all subjects for the student's class
// @route   GET /api/student/subjects
// @access  Private (Student)
const getStudentSubjects = async (req, res) => {
    try {
        const studentClassId = req.user.classId;
        if (!studentClassId) {
            return res.status(200).json([]);
        }
        
        const subjects = await Subject.find({ classId: studentClassId })
            .populate('assignedTeachers', 'name email phone');
            
        res.status(200).json(subjects);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching subjects.' });
    }
};

// @desc    Get student's attendance stats
// @route   GET /api/student/attendance/stats
// @access  Private (Student)
const getAttendanceStats = async (req, res) => {
    try {
        const studentId = req.user._id;
        const totalClasses = await Attendance.countDocuments({ studentId });
        const presentClasses = await Attendance.countDocuments({ studentId, status: 'Present' });
        
        const percentage = totalClasses > 0 ? ((presentClasses / totalClasses) * 100).toFixed(1) : 0;
        
        res.status(200).json({
            percentage,
            total: totalClasses,
            present: presentClasses
        });
    } catch (error) {
        res.status(500).json({ message: 'Error calculating attendance.' });
    }
};

// @desc    Get student's recent results
// @route   GET /api/student/results/recent
// @access  Private (Student)
const getRecentResults = async (req, res) => {
    try {
        const results = await Result.find({ studentId: req.user._id })
            .populate('subjectId', 'name code')
            .sort({ createdAt: -1 })
            .limit(5);
        
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching results.' });
    }
};

// @desc    Get all results for the student
// @route   GET /api/student/results
// @access  Private (Student)
const getResults = async (req, res) => {
    try {
        const results = await Result.find({ studentId: req.user._id })
            .populate('subjectId', 'name code')
            .sort({ createdAt: -1 });
        
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching result archive.' });
    }
};

// @desc    Get student dashboard summary (All stats in one call)
// @route   GET /api/student/dashboard/summary
// @access  Private (Student)
const getDashboardSummary = async (req, res) => {
    try {
        const student = await User.findById(req.user._id);
        const studentId = student._id;
        const classId = student.classId;

        // 1. Attendance
        const totalAttr = await Attendance.countDocuments({ studentId });
        const presentAttr = await Attendance.countDocuments({ studentId, status: 'Present' });
        const attendance = totalAttr > 0 ? ((presentAttr / totalAttr) * 100).toFixed(1) : 0;

        // 2. Assignments Pending (only if student is in a class)
        let pendingAssignments = 0;
        if (classId) {
            const assignments = await Assignment.find({ class: classId });
            pendingAssignments = assignments.filter(asm => 
                asm.submissions && !asm.submissions.some(sub => sub.student && sub.student.toString() === studentId.toString())
            ).length;
        }

        // 3. Results (Latest Performance Approximation)
        const results = await Result.find({ studentId });
        const validResults = results.filter(r => r.totalMarks > 0);
        const avgMarks = validResults.length > 0 
            ? (validResults.reduce((acc, curr) => acc + (curr.marksObtained / curr.totalMarks), 0) / validResults.length * 100).toFixed(1)
            : 0;

        // 4. Fees (Total Dues)
        const studentFees = await Fee.find({ student: studentId, status: { $ne: 'Paid' } });
        const totalDues = studentFees.reduce((acc, f) => acc + (f.amountDue - (f.amountPaid || 0)), 0);
        
        res.status(200).json({
            attendance,
            pendingAssignments,
            performance: avgMarks,
            gpa: validResults.length > 0 ? (avgMarks / 25).toFixed(1) : "0.0",
            totalDues
        });
    } catch (error) {
        res.status(500).json({ message: 'Error generating dashboard summary.', error: error.message });
    }
};

// @desc    Get student's detailed attendance history
// @route   GET /api/student/attendance/history
// @access  Private (Student)
const getAttendanceHistory = async (req, res) => {
    try {
        const studentId = req.user._id;
        const records = await Attendance.find({ studentId })
            .populate('classId', 'name stream')
            .sort({ date: -1 });
        
        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching attendance history.' });
    }
};

export {
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
};