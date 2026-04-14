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
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { margin: 0; padding: 0; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F4F7F9; color: #1f2937; }
                    .wrapper { padding: 40px 20px; text-align: center; }
                    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
                    .header-accent { height: 8px; background: linear-gradient(90deg, #155724, #2E8B57, #3CB371); }
                    .content { padding: 48px 40px; }
                    .logo { font-size: 28px; font-weight: 800; color: #155724; margin-bottom: 32px; letter-spacing: -0.5px; }
                    .title { font-size: 24px; font-weight: 700; color: #111827; margin-bottom: 16px; }
                    .desc { font-size: 16px; line-height: 1.6; color: #4b5563; margin-bottom: 32px; }
                    .btn-wrapper { margin: 40px 0; }
                    .btn { 
                        background-color: #2E8B57; 
                        color: #ffffff !important; 
                        padding: 16px 36px; 
                        text-decoration: none; 
                        border-radius: 14px; 
                        font-weight: 700; 
                        font-size: 16px;
                        display: inline-block;
                        box-shadow: 0 10px 15px -3px rgba(46, 139, 87, 0.3);
                        transition: transform 0.2s, box-shadow 0.2s;
                    }
                    .divider { border-top: 1px solid #f3f4f6; margin: 40px 0; }
                    .footer { padding-bottom: 40px; font-size: 14px; color: #9ca3af; }
                    .link-alt { font-size: 12px; color: #6b7280; word-break: break-all; margin-top: 20px; padding: 15px; background: #f9fafb; border-radius: 8px; }
                </style>
            </head>
            <body>
                <div class="wrapper">
                    <div class="container">
                        <div class="header-accent"></div>
                        <div class="content">
                            <div class="logo">SBS Badhwana</div>
                            <h1 class="title">Reset Your Password</h1>
                            <p class="desc">Hello ${user.name},<br>We received a request to secure your account <strong>${user.uniqueId}</strong>. Simply click the button below to choose a new password and regain access.</p>
                            
                            <div class="btn-wrapper">
                                <a href="${resetUrl}" class="btn">Secure My Account</a>
                            </div>

                            <p class="desc" style="font-size: 14px; background: #fffbeb; padding: 15px; border-radius: 12px; border: 1px solid #fef3c7; color: #92400e;">
                                <strong>💡 Note:</strong> If you are unable to reset your password through this link, please contact the school administration directly. For any other profile or academic details, only the administrator has the authority to make modifications.
                            </p>
                            
                            <div class="divider"></div>
                            
                            <p class="desc" style="font-size: 14px; margin-bottom: 10px;">If the button doesn't work, copy and paste this link into your browser:</p>
                            <div class="link-alt">${resetUrl}</div>
                        </div>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} SBS Badhwana Management System. All rights reserved.</p>
                        <p>This is an automated security message. Please do not reply.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        try {
            await sendEmail(user.email, 'Password Reset Request', message);

            // Mask email for security/privacy (e.g., ya***@gmail.com)
            const [localPart, domain] = user.email.split('@');
            const maskedLocal = localPart.length > 2 
                ? localPart.substring(0, 2) + '*'.repeat(localPart.length - 2)
                : localPart + '***';
            const maskedEmail = `${maskedLocal}@${domain}`;

            res.status(200).json({ 
                message: 'Password reset link sent to the registered email address.',
                maskedEmail 
            });
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
