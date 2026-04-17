import SiteSettings from '../models/SiteSettings.js';
import path from 'path';
import fs from 'fs';

// @desc    Get site settings
// @route   GET /api/public/settings OR /api/admin/settings
// @access  Public
export const getSettings = async (req, res) => {
    try {
        let settings = await SiteSettings.findOne();
        if (!settings) {
            // Create default settings if none exist
            settings = await SiteSettings.create({});
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update site settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
export const updateSettings = async (req, res) => {
    try {
        let settings = await SiteSettings.findOne();
        if (!settings) {
            settings = new SiteSettings();
        }

        // Update fields provided in req.body
        const updateData = req.body;
        
        // Use set() for deep updates to ensure Mongoose detects changes in nested objects
        Object.keys(updateData).forEach(key => {
            if (typeof updateData[key] === 'object' && updateData[key] !== null && !Array.isArray(updateData[key])) {
                // For top-level page keys (home, about, etc.), do a shallow merge of their sections
                settings[key] = { ...settings[key], ...updateData[key] };
            } else {
                settings[key] = updateData[key];
            }
        });

        // Mark modified to help Mongoose with nested objects if necessary
        settings.markModified('home');
        settings.markModified('about');
        settings.markModified('admissions');
        settings.markModified('contact');
        settings.markModified('global');

        const updatedSettings = await settings.save();
        res.json(updatedSettings);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Upload site media (Hero/Principal)
// @route   POST /api/admin/settings/upload
// @access  Private/Admin
export const uploadSiteMedia = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // The file is already uploaded to /uploads by multer
        const fileUrl = req.file.path.replace(/\\/g, '/');
        
        res.status(201).json({
            message: 'Image uploaded successfully',
            url: fileUrl
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
