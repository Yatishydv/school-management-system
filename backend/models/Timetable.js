import mongoose from 'mongoose';

const timetableSchema = new mongoose.Schema({
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true, unique: true },
    schedule: [{
        day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], required: true },
        subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
        startTime: { type: String, required: true }, // e.g., "09:00"
        endTime: { type: String, required: true }, // e.g., "09:45"
        room: { type: String }
    }]
}, { timestamps: true });

export default mongoose.model('Timetable', timetableSchema);