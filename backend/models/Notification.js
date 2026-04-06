// backend/models/Notification.js

import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { 
        type: String, 
        enum: ['All', 'Teachers', 'Students', 'Class', 'User'], 
        required: true 
    },
    targetId: { type: mongoose.Schema.Types.ObjectId, refPath: 'modelRef', default: null },
    modelRef: { 
        type: String, 
        enum: ['Class', 'User'], 
        required: function() { 
            return ['Class', 'User'].includes(this.targetType); 
        } 
    },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // For broadcasts
    isRead: { type: Boolean, default: false } // For private/individual notifications
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);
