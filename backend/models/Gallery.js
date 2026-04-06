import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
    title: { type: String, required: true },
    caption: { type: String },
    url: { type: String, required: true }, // Relative path to image file
    keywords: [{ type: String }],
    tags: [{ type: String }],
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Gallery', gallerySchema);