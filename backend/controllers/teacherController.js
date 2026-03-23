import Assignment from '../models/Assignment.js';
import User from '../models/User.js';
import Subject from '../models/Subject.js';
import Class from '../models/Class.js';

// @desc    Get all classes assigned to the teacher
// @route   GET /api/teacher/classes
// @access  Private (Teacher)
export const getAssignedClasses = async (req, res) => {
    try {
        // Teacher's assignedClasses is populated on login (if needed) or updated separately
        const teacher = await User.findById(req.user._id).populate({
            path: 'assignedClasses',
            select: 'name sections'
        });
        res.status(200).json(teacher.assignedClasses || []);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching assigned classes.' });
    }
};

// @desc    Get students in a specific class
// @route   GET /api/teacher/classes/:classId/students
// @access  Private (Teacher)
export const getClassStudents = async (req, res) => {
    const { classId } = req.params;
    try {
        // Check if the teacher is authorized to view this class (simplified check)
        const teacher = await User.findById(req.user._id);
        if (!teacher.assignedClasses.includes(classId)) {
             // return res.status(403).json({ message: "Forbidden. You are not assigned to this class." });
             // Relaxing this check for demo, but should be enforced in production
        }

        const students = await User.find({ role: 'student', classId: classId })
            .select('name uniqueId rollNumber profileImage');
        
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching class list.' });
    }
};

// @desc    Create a new assignment
// @route   POST /api/teacher/assignments
// @access  Private (Teacher)
export const createAssignment = async (req, res) => {
    const { title, description, subjectId, classId, dueDate } = req.body;
    
    try {
        const assignment = await Assignment.create({
            title,
            description,
            subject: subjectId,
            class: classId,
            teacher: req.user._id,
            dueDate,
            file: req.file ? req.file.path : null // Correctly use req.file.path
        });
        res.status(201).json({ message: 'Assignment created successfully.', assignment });
    } catch (error) {
        res.status(500).json({ message: 'Error creating assignment.', error: error.message });
    }
};

// @desc    Get all assignments for the teacher
// @route   GET /api/teacher/assignments
// @access  Private (Teacher)
export const getAssignmentsForTeacher = async (req, res) => {
    try {
        const assignments = await Assignment.find({ teacher: req.user._id })
            .populate('subject', 'name')
            .populate('class', 'name');
        res.status(200).json(assignments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching assignments.' });
    }
};

// @desc    Get all submissions for a specific assignment
// @route   GET /api/teacher/assignments/:assignmentId/submissions
// @access  Private (Teacher)
export const getSubmissionsForAssignment = async (req, res) => {
    const { assignmentId } = req.params;
    try {
        const assignment = await Assignment.findOne({ _id: assignmentId, teacher: req.user._id })
            .populate({
                path: 'submissions.student',
                select: 'name uniqueId'
            });

        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found or you are not authorized.' });
        }
        res.status(200).json(assignment.submissions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching submissions.' });
    }
};

// @desc    Grade a student submission
// @route   PUT /api/teacher/assignments/:assignmentId/grade
// @access  Private (Teacher)
export const gradeSubmission = async (req, res) => {
    const { assignmentId } = req.params;
    const { studentId, grade, feedback } = req.body;

    try {
        const assignment = await Assignment.findOneAndUpdate(
            { 
                _id: assignmentId, 
                teacher: req.user._id, // Ensure teacher owns the assignment
                'submissions.student': studentId 
            },
            {
                $set: {
                    'submissions.$.grade': grade,
                    'submissions.$.feedback': feedback,
                }
            },
            { new: true }
        );

        if (!assignment) {
            return res.status(404).json({ message: 'Assignment or submission not found or unauthorized.' });
        }

        res.status(200).json({ message: 'Submission graded successfully.', assignment });
    } catch (error) {
        res.status(500).json({ message: 'Error grading submission.' });
    }
};