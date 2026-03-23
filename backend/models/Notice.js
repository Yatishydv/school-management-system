import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    targetAudience: { 
        type: String, 
        enum: ['All', 'Teachers', 'Students', 'Specific Class'],
        default: 'All'
    },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', default: null }
}, { timestamps: true });

export default mongoose.model('Notice', noticeSchema);