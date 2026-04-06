import User from '../models/User.js';
import Notification from '../models/Notification.js';

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            if (req.file) {
                user.profileImage = req.file.path;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                profileImage: updatedUser.profileImage,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Change user password
// @route   PUT /api/user/change-password
// @access  Private
const changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user._id);

        if (user && (await user.matchPassword(oldPassword))) {
            user.password = newPassword;
            await user.save();
            res.json({ message: 'Password changed successfully' });
        } else {
            res.status(401).json({ message: 'Invalid old password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get notifications for logged in user
// @route   GET /api/users/notifications
// @access  Private
const getMyNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        const userRole = req.user.role; // 'admin', 'teacher', 'student'
        
        // Fetch full user to get class context
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User context not found.' });

        const userClassId = user.classId;
        const assignedClasses = user.assignedClasses || [];

        // Map roles to targetTypes
        const roleToTargetType = {
            'teacher': 'Teachers',
            'student': 'Students',
            'admin': 'All'
        };

        const orConditions = [
            { targetType: 'All' },
            { targetType: roleToTargetType[userRole] },
            { targetType: 'User', targetId: userId }
        ];

        // Role-based class filtering
        if (userRole === 'student' && userClassId) {
            orConditions.push({ targetType: 'Class', targetId: userClassId });
        } else if (userRole === 'teacher' && assignedClasses.length > 0) {
            orConditions.push({ targetType: 'Class', targetId: { $in: assignedClasses } });
        }

        const notifications = await Notification.find({ $or: orConditions })
            .populate('sender', 'name profileImage role')
            .sort({ createdAt: -1 });

        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications.', error: error.message });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/user/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) return res.status(404).json({ message: 'Notification not found.' });

        if (notification.targetType === 'User') {
            notification.isRead = true;
        } else {
            if (!notification.readBy.includes(req.user._id)) {
                notification.readBy.push(req.user._id);
            }
        }
        await notification.save();
        res.status(200).json({ message: 'Marked as read.' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating notification.', error: error.message });
    }
};

export {
    getProfile,
    updateProfile,
    changePassword,
    getMyNotifications,
    markAsRead
};
