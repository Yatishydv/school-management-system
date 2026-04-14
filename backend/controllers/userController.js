import User from '../models/User.js';
import Notification from '../models/Notification.js';
import fs from 'fs';
import path from 'path';

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
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
    console.log("Profile Update Request Body:", req.body);
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.phone = req.body.phone || user.phone;
        user.address = req.body.address || user.address;
        user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
        user.personalEmail = req.body.personalEmail || user.personalEmail;
        user.secondaryPhone = req.body.secondaryPhone || user.secondaryPhone;
        
        // Handle socialLinks (nested object)
        if (req.body.socialLinks) {
            try {
                const socials = typeof req.body.socialLinks === 'string' 
                    ? JSON.parse(req.body.socialLinks) 
                    : req.body.socialLinks;
                
                user.socialLinks = {
                    whatsapp: socials.whatsapp || (user.socialLinks?.whatsapp || ''),
                    instagram: socials.instagram || (user.socialLinks?.instagram || ''),
                    facebook: socials.facebook || (user.socialLinks?.facebook || ''),
                    twitter: socials.twitter || (user.socialLinks?.twitter || '')
                };
            } catch (parseErr) {
                console.error("Social links parse error:", parseErr);
            }
        }

        if (req.file) {
            console.log("File detected:", req.file.filename);
            
            // Delete old image if it exists and is different from default
            if (user.profileImage && user.profileImage !== 'uploads/default.png') {
                try {
                    // Critical Fix: Use absolute path relative to project root
                    const rootDir = path.resolve(__dirname, '..', '..');
                    const oldPath = path.join(rootDir, user.profileImage);
                    console.log("Attempting to delete old image at:", oldPath);
                    
                    if (fs.existsSync(oldPath)) {
                        fs.unlinkSync(oldPath);
                        console.log("SUCCESS: Old profile image deleted:", user.profileImage);
                    } else {
                        console.warn("WARNING: Old profile file not found on disk at:", oldPath);
                    }
                } catch (unlinkErr) {
                    console.error("CRITICAL: Failed to delete old image:", unlinkErr.message);
                }
            }

            // Construct new path relative to backend root
            user.profileImage = `uploads/${req.file.destination.split('uploads')[0] ? 'profileImage' : req.file.destination.split('uploads')[1]}/${req.file.filename}`.replace(/\/+/g, '/');
        }

        console.log("About to save user node...");
        const updatedUser = await user.save();
        console.log("User node saved successfully.");

        // Return CLEAN response to fix "Ghost Error"
        res.status(200).json({
            _id: updatedUser._id,
            uniqueId: updatedUser.uniqueId,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            phone: updatedUser.phone,
            address: updatedUser.address,
            bio: updatedUser.bio,
            personalEmail: updatedUser.personalEmail,
            secondaryPhone: updatedUser.secondaryPhone,
            socialLinks: {
                whatsapp: updatedUser.socialLinks?.whatsapp || "",
                instagram: updatedUser.socialLinks?.instagram || "",
                facebook: updatedUser.socialLinks?.facebook || "",
                twitter: updatedUser.socialLinks?.twitter || ""
            },
            profileImage: updatedUser.profileImage
        });
    } catch (error) {
        console.error("Profile update error:", error);
        res.status(500).json({ message: error.message || 'Update Protocol Violation' });
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
