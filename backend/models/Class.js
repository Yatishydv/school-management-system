import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
    name: { type: String, required: true }, // e.g., "Grade 10"
    stream: { type: String, enum: ['Science', 'Arts', 'General'], default: 'General' },
    sections: [{ type: String }], // e.g., ["A", "B"]
    classTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Compound index to allow same name for different streams
classSchema.index({ name: 1, stream: 1 }, { unique: true });

export default mongoose.model('Class', classSchema);