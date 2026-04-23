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
        const updateData = { ...req.body };
        
        // Ensure immutable paths are not modified
        delete updateData._id;
        delete updateData.__v;
        delete updateData.createdAt;
        delete updateData.updatedAt;

        // Use findOneAndUpdate with upsert to robustly replace configuration without deepMerge casting errors
        const updatedSettings = await SiteSettings.findOneAndUpdate(
            {},
            { $set: updateData },
            { new: true, upsert: true, runValidators: true }
        );
        
        res.json(updatedSettings);
    } catch (error) {
        console.error("Settings update error:", error);
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
