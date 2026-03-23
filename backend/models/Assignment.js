import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dueDate: { type: Date, required: true },
    file: { type: String }, // Path to the uploaded assignment file (e.g., PDF)
    
    submissions: [{
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        submissionFile: { type: String }, // Path to the student's submission file
        submittedAt: { type: Date, default: Date.now },
        grade: { type: Number, min: 0, max: 100, default: null },
        feedback: { type: String }
    }]
}, { timestamps: true });

export default mongoose.model('Assignment', assignmentSchema);