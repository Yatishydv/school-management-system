// backend/controllers/authController.js

import User from '../models/User.js';
import jwt from 'jsonwebtoken';

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

export { loginUser, registerAdmin, getMe };
