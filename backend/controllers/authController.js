// backend/controllers/authController.js

import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendEmail } from '../utils/email.js';

// Helper to generate JWT token
const generateToken = (userId, role, name) => {
    return jwt.sign({ userId, role, name }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { uniqueId, password } = req.body;

    console.log("LOGIN ATTEMPT - ID:", uniqueId, "PWD_LEN:", password?.length);

    try {
        const user = await User.findOne({ uniqueId });
        console.log("FOUND USER DOCUMENT:", user ? "YES" : "NO");

        if (!user) {
            console.log("❌ User not found:", uniqueId);
            return res.status(401).json({ message: 'Authentication failed: User ID not found.' });
        }

        // Compare password
        const isMatch = await user.matchPassword(password);
        console.log("PASSWORD MATCH:", isMatch);

        if (!isMatch) {
            console.log("❌ Password mismatch for:", uniqueId);
            return res.status(401).json({ message: 'Authentication failed: Incorrect password.' });
        }

        const token = generateToken(user._id, user.role, user.name);

        console.log("✅ LOGIN SUCCESS:", user.uniqueId);

        return res.json({
            _id: user._id,
            name: user.name,
            uniqueId: user.uniqueId,
            email: user.email,
            role: user.role,
            profileImage: user.profileImage,
            address: user.address,
            phone: user.phone,
            rollNumber: user.rollNumber,
            classId: user.classId,
            token,
        });

    } catch (error) {
        console.log("🔥 LOGIN ERROR:", error);
        return res.status(500).json({ message: 'Server error during login.' });
    }
};

// @desc    Register a new Admin (Initial Setup Only)
// @route   POST /api/auth/register-admin
// @access  Public (Should be protected later)
const registerAdmin = async (req, res) => {
    const { name, email, password } = req.body;

    if (await User.findOne({ role: 'admin' })) {
        return res.status(400).json({ message: 'Admin already exists.' });
    }

    try {
        const uniqueId = "ADMIN-" + Math.floor(1000 + Math.random() * 9000);

        const user = await User.create({
            name,
            email,
            password,
            uniqueId,
            role: 'admin',
        });

        return res.status(201).json({
            _id: user._id,
            uniqueId: user.uniqueId,
            role: user.role,
            token: generateToken(user._id, user.role, user.name),
        });

    } catch (error) {
        console.log("ADMIN CREATE ERROR:", error);
        res.status(500).json({ message: 'Server error during admin registration.' });
    }
};

// @desc    Get current user's profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        return res.status(200).json(user);

    } catch (error) {
        console.log("GET PROFILE ERROR:", error);
        return res.status(500).json({ message: 'Server error fetching profile.' });
    }
};

// @desc    Forgot Password - Send reset link
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    const { identifier } = req.body; // Strictly Unique ID now as per user request

    try {
        // Find user matching strictly by Unique ID
        const user = await User.findOne({ uniqueId: identifier });

        if (!user) {
            return res.status(404).json({ message: 'No account found with this Unique ID.' });
        }

        if (!user.email) {
            return res.status(400).json({ message: 'This account does not have a registered email address. Please contact the administrator.' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        
        user.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
        user.resetPasswordExpire = Date.now() + 60 * 60 * 1000;
        
        await user.save();

        // Create reset URL
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        const message = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    .container { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 12px; }
                    .header { text-align: center; padding: 20px 0; }
                    .card { background: #ffffff; padding: 40px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e5e7eb; }
                    .title { font-size: 24px; font-weight: 700; color: #111827; margin-bottom: 16px; text-align: center; }
                    .text { color: #4b5563; margin-bottom: 24px; font-size: 16px; text-align: center; }
                    .btn-container { text-align: center; margin-bottom: 30px; }
                    .btn { background-color: #6366f1; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: 600; display: inline-block; transition: background-color 0.2s; }
                    .footer { text-align: center; font-size: 12px; color: #9ca3af; margin-top: 30px; }
                    .divider { border-top: 1px solid #e5e7eb; margin: 24px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2 style="color: #6366f1; margin: 0;">School Management System</h2>
                    </div>
                    <div class="card">
                        <h1 class="title">Reset Your Password</h1>
                        <p class="text">Hello ${user.name},<br>We received a request to reset your password for account <strong>${user.uniqueId}</strong>. Click the button below to choose a new one.</p>
                        
                        <div class="btn-container">
                            <a href="${resetUrl}" class="btn">Reset Password</a>
                        </div>
                        
                        <div class="divider"></div>
                        
                        <p class="text" style="font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
                        <p style="font-size: 11px; color: #6b7280; word-break: break-all; margin-top: 10px; text-align: center;">${resetUrl}</p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} School Management System. All rights reserved.</p>
                        <p>If you didn't request this email, you can safely ignore it.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        try {
            await sendEmail(user.email, 'Password Reset Request', message);
            res.status(200).json({ message: 'Password reset link sent to the registered email address.' });
        } catch (err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            return res.status(500).json({ message: 'Email could not be sent. Please try again later.' });
        }

    } catch (error) {
        console.error("FORGOT PASSWORD ERROR:", error);
        res.status(500).json({ message: 'Server error during forgot password process.' });
    }
};

// @desc    Reset Password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
    // Hash token from URL
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    try {
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token.' });
        }

        // Set new password (it will be hashed by pre-save middleware)
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({ message: 'Password reset successful! You can now login with your new password.' });

    } catch (error) {
        console.error("RESET PASSWORD ERROR:", error);
        res.status(500).json({ message: 'Server error during password reset.' });
    }
};

export { loginUser, registerAdmin, getMe, forgotPassword, resetPassword };
