import Notice from '../models/Notice.js';
import User from '../models/User.js';
import Gallery from '../models/Gallery.js';

// @desc    Get public notices and events
// @route   GET /api/public/notices
// @access  Public
export const getPublicNotices = async (req, res) => {
    try {
        const notices = await Notice.find({ targetAudience: { $in: ['All', 'Public'] } })
            .select('title content createdAt')
            .sort({ createdAt: -1 })
            .limit(10);
        res.status(200).json(notices);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching public notices.' });
    }
};

// @desc    Get school gallery photos
// @route   GET /api/public/gallery
// @access  Public
export const getGallery = async (req, res) => {
    try {
        const gallery = await Gallery.find().select('title caption url keywords tags date').sort({ date: -1 });
        res.status(200).json(gallery);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching gallery.' });
    }
};

// @desc    Get list of teachers for public display
// @route   GET /api/public/teachers
// @access  Public
export const getPublicTeachers = async (req, res) => {
    try {
        const teachers = await User.find({ role: 'teacher' })
            .select('name uniqueId profileImage phone email');
        res.status(200).json(teachers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching teachers list.' });
    }
};

// @desc    Get basic school statistics
// @route   GET /api/public/stats
// @access  Public
export const getSchoolStats = async (req, res) => {
    try {
        const studentCount = await User.countDocuments({ role: 'student' });
        const teacherCount = await User.countDocuments({ role: 'teacher' });
        res.status(200).json({
            students: studentCount,
            teachers: teacherCount,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching school statistics.' });
    }
};

// @desc    Get school contact and social info (from Admin profile)
// @route   GET /api/public/school-info
// @access  Public
export const getSchoolInfo = async (req, res) => {
    try {
        // Find the main admin (Master Admin)
        const admin = await User.findOne({ role: 'admin' })
            .select('name email phone address socialLinks profileImage');
        
        if (!admin) {
            return res.status(404).json({ message: 'School info not found.' });
        }

        res.status(200).json(admin);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching school info.' });
    }
};