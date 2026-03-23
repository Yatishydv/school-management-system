import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, // e.g., "Mathematics"
    code: { type: String, unique: true }, // e.g., "MATH101"
    assignedTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true }
}, { timestamps: true });

export default mongoose.model('Subject', subjectSchema);