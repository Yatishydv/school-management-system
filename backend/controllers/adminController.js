import User from '../models/User.js';
import Class from '../models/Class.js';
import Subject from '../models/Subject.js';
import Fee from '../models/Fee.js';
import Timetable from '../models/Timetable.js';
import Notice from '../models/Notice.js';
import Gallery from '../models/Gallery.js';
import bcrypt from 'bcryptjs';
import { generateUniqueId, generateRandomPassword } from '../utils/generateId.js';
import { sendEmail } from '../utils/email.js';

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalTeachers = await User.countDocuments({ role: 'teacher' });
        const totalClasses = await Class.countDocuments();
        const totalSubjects = await Subject.countDocuments();
        const totalPendingFees = await Fee.countDocuments({ status: 'Pending' });

        res.status(200).json({
            totalUsers,
            totalStudents,
            totalTeachers,
            totalClasses,
            totalSubjects,
            totalPendingFees,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching dashboard stats.', error: error.message });
    }
};


// --- User Management ---

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching users.', error: error.message });
    }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private (Admin)
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: 'User not found.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching user.', error: error.message });
    }
};

// @desc    Add a new user
// @route   POST /api/admin/users
// @access  Private (Admin)
const addUser = async (req, res) => {
    const { name, email, password, role, classId, section } = req.body;

    try {
        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User with that email already exists.' });
        }

        // Generate unique ID
        const uniqueId = await generateUniqueId(role);

        // Hash password (if provided, otherwise generate a random one)
        const userPassword = password || generateRandomPassword();
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userPassword, salt);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            uniqueId,
            class: classId || null, // Only assign if provided
            section: section || null, // Only assign if provided
        });

        if (newUser) {
            // Send welcome email with generated password if no password was provided
            if (!password) {
                const emailSubject = 'Welcome to School Management System - Your Account Details';
                const emailHtml = `
                    <p>Dear ${name},</p>
                    <p>Welcome to the School Management System! Your account has been created.</p>
                    <p>Your login details are:</p>
                    <ul>
                        <li><strong>Email:</strong> ${email}</li>
                        <li><strong>Unique ID:</strong> ${uniqueId}</li>
                        <li><strong>Temporary Password:</strong> ${userPassword}</li>
                    </ul>
                    <p>Please log in and change your password as soon as possible.</p>
                    <p>Regards,</p>
                    <p>School Management System Admin</p>
                `;
                await sendEmail(email, emailSubject, emailHtml);
            }

            res.status(201).json({
                message: 'User added successfully.',
                user: {
                    _id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role,
                    uniqueId: newUser.uniqueId,
                    class: newUser.class,
                    section: newUser.section,
                },
            });
        } else {
            res.status(400).json({ message: 'Invalid user data.' });
        }
    } catch (error) {
        console.error('Error adding user:', error);
        res.status(500).json({ message: 'Server error during user creation.', error: error.message });
    }
};

// @desc    Update user details
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
const updateUser = async (req, res) => {
    const { name, email, role, classId, section } = req.body;

    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.name = name || user.name;
            user.email = email || user.email;
            user.role = role || user.role;
            user.class = classId || user.class;
            user.section = section || user.section;

            const updatedUser = await user.save();

            res.status(200).json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                uniqueId: updatedUser.uniqueId,
                class: updatedUser.class,
                section: updatedUser.section,
            });
        } else {
            res.status(404).json({ message: 'User not found.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error updating user.', error: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            await user.deleteOne();
            res.status(200).json({ message: 'User removed.' });
        } else {
            res.status(404).json({ message: 'User not found.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting user.', error: error.message });
    }
};

// @desc    Reset user password
// @route   PUT /api/admin/users/:id/reset-password
// @access  Private (Admin)
const resetPassword = async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const newGeneratedPassword = generateRandomPassword(); // Generate a new random password

        // Hash the new password and save (User model pre-save hook handles hashing for update)
        user.password = newGeneratedPassword; 
        await user.save(); 

        // Send the new password to the user's email
        const emailSubject = 'Your Password Has Been Reset';
        const emailHtml = `
            <p>Dear ${user.name},</p>
            <p>Your password for the School Management System has been reset.</p>
            <p>Your new password is: <strong>${newGeneratedPassword}</strong></p>
            <p>Please log in with your new password and consider changing it to something memorable.</p>
            <p>Regards,</p>
            <p>School Management System Admin</p>
        `;
        await sendEmail(user.email, emailSubject, emailHtml);

        res.status(200).json({ message: `Password for ${user.uniqueId} reset successfully. New password sent to user's email.` });
    } catch (error) {
        console.error('Error during password reset:', error);
        res.status(500).json({ message: 'Server error during password reset.', error: error.message });
    }
};



// --- Class Management ---

// @desc    Get all classes
// @route   GET /api/admin/classes
// @access  Private (Admin)
const getClasses = async (req, res) => {
    try {
        const classes = await Class.find().populate('classTeacher', 'name uniqueId');
        res.status(200).json(classes);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching classes.', error: error.message });
    }
};

// @desc    Create a new class
// @route   POST /api/admin/classes
// @access  Private (Admin)
const createClass = async (req, res) => {
    const { name, sections, classTeacherId } = req.body;
    
    try {
        const newClass = await Class.create({ 
            name, 
            sections, 
            classTeacher: classTeacherId 
        });
        res.status(201).json({ message: 'Class created successfully.', class: newClass });
    } catch (error) {
        res.status(400).json({ message: 'Failed to create class.', error: error.message });
    }
};

// @desc    Delete a class
// @route   DELETE /api/admin/classes/:id
// @access  Private (Admin)
const deleteClass = async (req, res) => {
    try {
        const deletedClass = await Class.findByIdAndDelete(req.params.id);
        if (!deletedClass) {
            return res.status(404).json({ message: 'Class not found.' });
        }
        // Add cleanup logic here (e.g., unassign students and teachers)
        res.status(200).json({ message: 'Class deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting class.', error: error.message });
    }
};



// --- Subject Management ---

// @desc    Get all subjects
// @route   GET /api/admin/subjects
// @access  Private (Admin)
const getSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find()
            .populate('assignedTeacher', 'name uniqueId')
            .populate('classId', 'name');
        res.status(200).json(subjects);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching subjects.', error: error.message });
    }
};

// @desc    Create a new subject
// @route   POST /api/admin/subjects
// @access  Private (Admin)
const createSubject = async (req, res) => {
    const { name, code, assignedTeacherId, classId } = req.body;
    
    try {
        const newSubject = await Subject.create({ 
            name, 
            code, 
            assignedTeacher: assignedTeacherId,
            classId
        });
        res.status(201).json({ message: 'Subject created successfully.', subject: newSubject });
    } catch (error) {
        res.status(400).json({ message: 'Failed to create subject.', error: error.message });
    }
};

// @desc    Delete a subject
// @route   DELETE /api/admin/subjects/:id
// @access  Private (Admin)
const deleteSubject = async (req, res) => {
    try {
        const deletedSubject = await Subject.findByIdAndDelete(req.params.id);
        if (!deletedSubject) {
            return res.status(404).json({ message: 'Subject not found.' });
        }
        res.status(200).json({ message: 'Subject deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting subject.', error: error.message });
    }
};


// --- Timetable Management ---

// @desc    Create/Update class timetable
// @route   POST /api/admin/timetable
// @access  Private (Admin)
const manageTimetable = async (req, res) => {
    const { classId, schedule } = req.body; // schedule should be an array of objects: [{ day, subjectId, startTime, endTime }]

    try {
        // Find existing timetable or create a new one
        const timetable = await Timetable.findOneAndUpdate(
            { class: classId },
            { class: classId, schedule },
            { upsert: true, new: true }
        ).populate({
            path: 'schedule.subject',
            select: 'name code'
        });

        res.status(200).json({ message: 'Timetable updated successfully.', timetable });
    } catch (error) {
        res.status(500).json({ message: 'Error managing timetable.', error: error.message });
    }
};


// --- Fees Management ---

// @desc    Get all fee records
// @route   GET /api/admin/fees
// @access  Private (Admin)
const getFeeRecords = async (req, res) => {
    try {
        const fees = await Fee.find()
            .populate('student', 'name uniqueId rollNumber')
            .sort({ dueDate: 1 }); // Sort by due date
        
        // Simple analytics
        const totalPending = fees.filter(f => f.status === 'Pending' || f.status === 'Overdue').reduce((acc, f) => acc + (f.amountDue - f.amountPaid), 0);

        res.status(200).json({ fees, analytics: { totalPending } });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching fee records.', error: error.message });
    }
};

// @desc    Record a new fee payment
// @route   POST /api/admin/fees/:id/payment
// @access  Private (Admin)
const recordPayment = async (req, res) => {
    const feeId = req.params.id;
    const { amount, method } = req.body;

    try {
        const fee = await Fee.findById(feeId);
        if (!fee) return res.status(404).json({ message: 'Fee record not found.' });

        const newAmountPaid = fee.amountPaid + amount;
        
        fee.amountPaid = newAmountPaid;
        fee.paymentHistory.push({ amount, method });
        
        if (newAmountPaid >= fee.amountDue) {
            fee.status = 'Paid';
        } else if (newAmountPaid > 0) {
            fee.status = 'Partial';
        }

        await fee.save();
        res.status(200).json({ message: 'Payment recorded successfully.', fee });

    } catch (error) {
        res.status(500).json({ message: 'Error recording payment.', error: error.message });
    }
};

// --- Notice & Event Management ---

// @desc    Get all notices
// @route   GET /api/admin/notices
// @access  Private (Admin)
const getNotices = async (req, res) => {
    try {
        const notices = await Notice.find()
            .populate('author', 'name')
            .populate('targetClass', 'name')
            .sort({ date: -1 });
        res.status(200).json(notices);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notices.', error: error.message });
    }
};


// @desc    Create a new notice or event
// @route   POST /api/admin/notices
// @access  Private (Admin)
const createNotice = async (req, res) => {
    const { title, content, targetAudience, classId } = req.body;
    try {
        const newNotice = await Notice.create({
            title,
            content,
            author: req.user._id,
            targetAudience,
            classId: targetAudience === 'Specific Class' ? classId : null,
        });
        res.status(201).json({ message: 'Notice posted successfully.', notice: newNotice });
    } catch (error) {
        res.status(500).json({ message: 'Error posting notice.', error: error.message });
    }
};

// @desc    Delete a notice
// @route   DELETE /api/admin/notices/:id
// @access  Private (Admin)
const deleteNotice = async (req, res) => {
    try {
        const notice = await Notice.findByIdAndDelete(req.params.id);
        if (!notice) {
            return res.status(404).json({ message: 'Notice not found.' });
        }
        res.status(200).json({ message: 'Notice deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting notice.', error: error.message });
    }
};


// --- Gallery Management ---

// @desc    Get all gallery images
// @route   GET /api/admin/gallery
// @access  Private (Admin)
const getGalleryImages = async (req, res) => {
    try {
        const images = await Gallery.find().sort({ uploadedAt: -1 });
        res.status(200).json(images);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching gallery images.', error: error.message });
    }
};


// @desc    Upload image to gallery
// @route   POST /api/admin/gallery
// @access  Private (Admin)
const uploadGalleryImage = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No image file provided." });
    }

    try {
        const newImage = await Gallery.create({
            caption: req.body.caption || 'School Event Photo',
            url: req.file.path, // Use req.file.path
            uploadedBy: req.user._id
        });
        res.status(201).json({ message: 'Image uploaded to gallery.', image: newImage });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading image.', error: error.message });
    }
};

// @desc    Delete a gallery image
// @route   DELETE /api/admin/gallery/:id
// @access  Private (Admin)
const deleteGalleryImage = async (req, res) => {
    try {
        const image = await Gallery.findByIdAndDelete(req.params.id);
        if (!image) {
            return res.status(404).json({ message: 'Image not found.' });
        }
        // Optional: Delete the actual file from the server
        // const fs = require('fs');
        // fs.unlink(image.url, (err) => { ... });
        res.status(200).json({ message: 'Image deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting image.', error: error.message });
    }
};



export {
    getDashboardStats,
    getUsers,
    getUserById,
    addUser,
    updateUser,
    deleteUser,
    resetPassword,
    getClasses,
    createClass,
    deleteClass,
    getSubjects,
    createSubject,
    deleteSubject,
    manageTimetable,
    getFeeRecords,
    recordPayment,
    getNotices,
    createNotice,
    deleteNotice,
    getGalleryImages,
    uploadGalleryImage,
    deleteGalleryImage,
};