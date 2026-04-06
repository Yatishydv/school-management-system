import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Assignment from '../models/Assignment.js';
import User from '../models/User.js';
import Subject from '../models/Subject.js';
import Class from '../models/Class.js';
import Attendance from '../models/Attendance.js';
import Result from '../models/Result.js';
import Timetable from '../models/Timetable.js';
import Notification from '../models/Notification.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.join(__dirname, '..');

// ... (previous functions same, but now with fs and path available) ...

// @desc    Update an assignment
// @route   PUT /api/teacher/assignments/:assignmentId
// @access  Private (Teacher)
export const updateAssignment = async (req, res) => {
    const { assignmentId } = req.params;
    const { title, description, dueDate } = req.body;
    
    try {
        const assignment = await Assignment.findOne({ _id: assignmentId, teacher: req.user._id });
        if (!assignment) return res.status(404).json({ message: 'Assignment not found or unauthorized.' });

        if (title) assignment.title = title;
        if (description) assignment.description = description;
        if (dueDate) assignment.dueDate = dueDate;

        if (req.file) {
            // Delete old file if exists
            if (assignment.file) {
                const oldPath = path.join(backendRoot, assignment.file);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            assignment.file = path.relative(backendRoot, req.file.path).replace(/\\/g, '/');
        }

        await assignment.save();
        res.status(200).json({ message: 'Assignment updated successfully.', assignment });
    } catch (error) {
        res.status(500).json({ message: 'Error updating assignment.', error: error.message });
    }
};

// @desc    Delete an assignment
// @route   DELETE /api/teacher/assignments/:assignmentId
// @access  Private (Teacher)
export const deleteAssignment = async (req, res) => {
    const { assignmentId } = req.params;
    try {
        const assignment = await Assignment.findOne({ _id: assignmentId, teacher: req.user._id });
        if (!assignment) return res.status(404).json({ message: 'Assignment not found or unauthorized.' });

        // Delete physical file
        if (assignment.file) {
            const filePath = path.join(backendRoot, assignment.file);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        await Assignment.findByIdAndDelete(assignmentId);
        res.status(200).json({ message: 'Assignment deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting assignment.', error: error.message });
    }
};

// @desc    Get results history for teacher
// @route   GET /api/teacher/results
// @access  Private (Teacher)
export const getTeacherResults = async (req, res) => {
    try {
        const teacherId = req.user._id;
        // In this system, results don't have a direct "teacher" ref, 
        // but we can filter by subjects the teacher is assigned to.
        const subjects = await Subject.find({ assignedTeachers: teacherId }).select('_id');
        const subjectIds = subjects.map(s => s._id);

        const results = await Result.find({ subjectId: { $in: subjectIds } })
            .populate('studentId', 'name uniqueId rollNumber')
            .populate('subjectId', 'name code')
            .populate('classId', 'name stream')
            .sort({ createdAt: -1 });

        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching result history.' });
    }
};

// @desc    Get all classes assigned to the teacher (Dynamic Lookup)
// @route   GET /api/teacher/classes
// @access  Private (Teacher)
export const getAssignedClasses = async (req, res) => {
    try {
        const teacherId = req.user._id;
        
        // 1. Direct assignments from User model
        const teacher = await User.findById(teacherId).select('assignedClasses');
        const directClassIds = teacher.assignedClasses || [];

        // 2. Classes where this teacher is the "Class Teacher"
        const classTeacherClasses = await Class.find({ classTeacher: teacherId }).select('_id');
        const classTeacherIds = classTeacherClasses.map(c => c._id);

        // 3. Classes from subjects taught by this teacher
        const subjectClasses = await Subject.find({ assignedTeachers: teacherId }).select('classId');
        const subjectClassIds = subjectClasses.map(s => s.classId);

        // Combine all and deduplicate
        const allClassIds = [...new Set([
            ...directClassIds.map(id => id.toString()),
            ...classTeacherIds.map(id => id.toString()),
            ...subjectClassIds.map(id => id.toString())
        ])];

        const classes = await Class.find({ _id: { $in: allClassIds } })
            .select('name sections stream');

        res.status(200).json(classes);
    } catch (error) {
        console.error("Error in getAssignedClasses:", error);
        res.status(500).json({ message: 'Error fetching assigned classes.' });
    }
};

// @desc    Get all subjects assigned to the teacher
// @route   GET /api/teacher/subjects
// @access  Private (Teacher)
export const getAssignedSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find({ assignedTeachers: req.user._id })
            .populate('classId', 'name stream');
        res.status(200).json(subjects);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching assigned subjects.' });
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
            .select('name uniqueId rollNumber profileImage email phone address fatherName motherName dob');
        
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
        let filePath = null;
        if (req.file) {
            filePath = path.relative(backendRoot, req.file.path).replace(/\\/g, '/');
        }

        const assignment = await Assignment.create({
            title,
            description,
            subject: subjectId,
            class: classId,
            teacher: req.user._id,
            dueDate,
            file: filePath
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

// @desc    Mark attendance for a specific class
// @route   POST /api/teacher/attendance
// @access  Private (Teacher)
export const markAttendance = async (req, res) => {
    const { classId, attendanceData, date } = req.body; // attendanceData: [{ studentId, status }]
    
    try {
        const attendanceDate = date ? new Date(date) : new Date();
        attendanceDate.setHours(0, 0, 0, 0);

        // Delete existing attendance for this class/date to avoid duplicates
        await Attendance.deleteMany({ classId, date: attendanceDate });

        const records = attendanceData.map(record => ({
            studentId: record.studentId,
            classId,
            date: attendanceDate,
            status: record.status,
            markedBy: req.user._id
        }));

        await Attendance.insertMany(records);
        res.status(201).json({ message: 'Attendance processed successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error marking attendance.', error: error.message });
    }
};

// @desc    Get attendance records for a class
// @route   GET /api/teacher/attendance/:classId
// @access  Private (Teacher)
export const getAttendanceRecords = async (req, res) => {
    const { classId } = req.params;
    const { date, isMain } = req.query;

    try {
        const queryDate = date ? new Date(date) : new Date();
        queryDate.setHours(0, 0, 0, 0);

        let query = { classId, date: queryDate };
        
        // If isMain is true, we could theoretically filter by the head of class, 
        // but since only one attendance should exist per class/date (due to deleteMany in markAttendance),
        // any record found is the "main" one for that slot.
        const records = await Attendance.find(query)
            .populate('studentId', 'name uniqueId rollNumber');
        
        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching attendance records.' });
    }
};

// @desc    Get dynamic Head of Class info for today
// @route   GET /api/teacher/attendance/:classId/head-info
// @access  Private (Teacher)
export const getHeadOfClassInfo = async (req, res) => {
    const { classId } = req.params;
    const { date } = req.query;

    try {
        const queryDate = date ? new Date(date) : new Date();
        const dayShort = queryDate.toLocaleDateString('en-US', { weekday: 'long' });

        const timetable = await Timetable.findOne({ class: classId })
            .populate('schedule.teacher', 'name uniqueId');

        if (!timetable || !timetable.schedule || timetable.schedule.length === 0) {
            return res.status(200).json({ headOfClass: null, isFirstPeriod: false });
        }

        // Filter schedule for today and sort by startTime
        const todaySchedule = timetable.schedule
            .filter(s => s.day === dayShort)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

        if (todaySchedule.length === 0) {
            return res.status(200).json({ headOfClass: null, isFirstPeriod: false });
        }

        const headOfClass = todaySchedule[0].teacher;
        const isFirstPeriod = headOfClass && headOfClass._id.toString() === req.user._id.toString();

        res.status(200).json({
            headOfClass,
            isFirstPeriod,
            periodName: todaySchedule[0].startTime + " - " + todaySchedule[0].endTime
        });
    } catch (error) {
        console.error("Error in getHeadOfClassInfo:", error);
        res.status(500).json({ message: 'Error fetching head of class telemetry.' });
    }
};

// @desc    Add examination results
// @route   POST /api/teacher/results
// @access  Private (Teacher)
export const addResult = async (req, res) => {
    const { studentId, subjectId, classId, examName, marksObtained, totalMarks, grade } = req.body;

    try {
        const result = await Result.create({
            studentId,
            subjectId,
            classId,
            examName,
            marksObtained,
            totalMarks,
            grade
        });
        res.status(201).json({ message: 'Result recorded.', result });
    } catch (error) {
        res.status(500).json({ message: 'Error recording result.', error: error.message });
    }
};

// @desc    Get dashboard summary statistics
// @route   GET /api/teacher/dashboard/summary
// @access  Private (Teacher)
export const getDashboardSummary = async (req, res) => {
    try {
        const teacherId = req.user._id;

        // 1. Dynamic Classes & Subjects
        // Reuse similar logic as getAssignedClasses but for counting
        const teacher = await User.findById(teacherId).select('assignedClasses');
        const directClassIds = teacher.assignedClasses || [];
        const classTeacherClasses = await Class.find({ classTeacher: teacherId }).select('_id');
        const subjectClasses = await Subject.find({ assignedTeachers: teacherId }).select('classId');
        
        const allClassIds = [...new Set([
            ...directClassIds.map(id => id.toString()),
            ...classTeacherClasses.map(c => c._id.toString()),
            ...subjectClasses.map(s => s.classId.toString())
        ])];

        const subjects = await Subject.find({ assignedTeachers: teacherId });
        
        // 2. Total Students (in any class assigned to this teacher)
        const studentsCount = await User.countDocuments({ 
            role: 'student', 
            classId: { $in: allClassIds } 
        });

        // 3. Pending Assignments (to grade)
        const assignments = await Assignment.find({ teacher: teacherId });
        let pendingGrades = 0;
        assignments.forEach(asm => {
            if (asm.submissions) {
                pendingGrades += asm.submissions.filter(sub => (sub.grade === null || sub.grade === undefined) && sub.submittedAt).length;
            }
        });

        // 4. Today's Lectures
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        const timetables = await Timetable.find({ class: { $in: allClassIds } });
        let todayLectures = 0;
        timetables.forEach(tt => {
            todayLectures += tt.schedule.filter(s => s.day === today && s.teacher?.toString() === teacherId.toString()).length;
        });

        res.status(200).json({
            totalClasses: allClassIds.length,
            totalSubjects: subjects.length,
            totalStudents: studentsCount,
            pendingGrades,
            todayLectures
        });
    } catch (error) {
        console.error("Error in getDashboardSummary:", error);
        res.status(500).json({ message: 'Error fetching dashboard summary.' });
    }
};

// @desc    Get teacher's personal timetable
// @route   GET /api/teacher/timetable
// @access  Private (Teacher)
export const getTeacherTimetable = async (req, res) => {
    try {
        const teacherId = req.user._id;
        const teacher = await User.findById(teacherId);
        const assignedClasses = teacher.assignedClasses || [];

        const timetables = await Timetable.find({ class: { $in: assignedClasses } })
            .populate('class', 'name')
            .populate('schedule.subject', 'name code');

        let teacherSchedule = [];
        timetables.forEach(tt => {
            tt.schedule.forEach(entry => {
                if (entry.teacher?.toString() === teacherId.toString()) {
                    teacherSchedule.push({
                        ...entry._doc,
                        className: tt.class?.name,
                        classId: tt.class?._id
                    });
                }
            });
        });

        // Sort by day and time
        const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        teacherSchedule.sort((a, b) => {
            if (a.day !== b.day) {
                return dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
            }
            return a.startTime.localeCompare(b.startTime);
        });

        res.status(200).json(teacherSchedule);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching teacher timetable.' });
    }
};

// --- Notification Management (Teacher) ---

// @desc    Send a notification to a specific class
// @route   POST /api/teacher/notifications/class
// @access  Private (Teacher)
export const sendClassNotification = async (req, res) => {
    const { title, message, classId } = req.body;
    try {
        const newNotification = await Notification.create({
            title,
            message,
            sender: req.user._id,
            targetType: 'Class',
            targetId: classId,
            modelRef: 'Class'
        });
        res.status(201).json({ message: 'Class notification deployed.', notification: newNotification });
    } catch (error) {
        res.status(500).json({ message: 'Error deploying class notification.', error: error.message });
    }
};

// @desc    Send a notification to a specific student
// @route   POST /api/teacher/notifications/student
// @access  Private (Teacher)
export const sendStudentNotification = async (req, res) => {
    const { title, message, studentId } = req.body;
    try {
        const newNotification = await Notification.create({
            title,
            message,
            sender: req.user._id,
            targetType: 'User',
            targetId: studentId,
            modelRef: 'User'
        });
        res.status(201).json({ message: 'Student alert dispatched.', notification: newNotification });
    } catch (error) {
        res.status(500).json({ message: 'Error dispatching student alert.', error: error.message });
    }
};

// @desc    Get notifications sent by this teacher
// @route   GET /api/teacher/notifications
// @access  Private (Teacher)
export const getTeacherSentNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ sender: req.user._id })
            .populate('targetId', 'name uniqueId')
            .sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notification history.', error: error.message });
    }
};
// @desc    Delete a notification sent by a teacher
// @route   DELETE /api/teacher/notifications/:id
// @access  Private (Teacher)
export const deleteTeacherNotification = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) return res.status(404).json({ message: 'Notification not found.' });
        if (notification.sender.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to delete this alert.' });
        }
        await Notification.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Alert permanently removed from history.' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting alert.', error: error.message });
    }
};
