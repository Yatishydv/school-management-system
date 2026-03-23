import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, // e.g., "Grade 10"
    sections: [{ type: String, required: true }], // e.g., ["A", "B"]
    classTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('Class', classSchema);