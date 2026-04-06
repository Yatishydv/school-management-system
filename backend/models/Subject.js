import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
    name: { type: String, required: true }, // e.g., "Mathematics"
    code: { type: String }, // e.g., "MATH101"
    assignedTeachers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true }
}, { timestamps: true });

export default mongoose.model('Subject', subjectSchema);