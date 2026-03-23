import Assignment from '../models/Assignment.js';
import Timetable from '../models/Timetable.js';
import Fee from '../models/Fee.js';
import Notice from '../models/Notice.js';

// @desc    Get student's timetable
// @route   GET /api/student/timetable
// @access  Private (Student)
const getTimetable = async (req, res) => {
    try {
        const studentClassId = req.user.classId;

        const timetable = await Timetable.findOne({ class: studentClassId })
            .populate({
                path: 'schedule.subject',
                select: 'name code assignedTeacher',
                populate: { path: 'assignedTeacher', select: 'name uniqueId' }
            });

        if (!timetable) {
            return res.status(404).json({ message: 'Timetable not found for your class.' });
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
            .populate('classId', 'name');
        
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


export {
    getTimetable,
    getAssignments,
    submitAssignment,
    getFeeStatus,
    getNotices,
};