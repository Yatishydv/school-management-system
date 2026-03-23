import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String },
    attachment: { type: String }, // URL/Path to attached file/image
    isRead: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Message', messageSchema);