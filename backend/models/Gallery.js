import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
    caption: { type: String, required: true },
    url: { type: String, required: true }, // Relative path to image file
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Gallery', gallerySchema);