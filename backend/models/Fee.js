import mongoose from 'mongoose';

const feeSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amountDue: { type: Number, required: true },
    amountPaid: { type: Number, default: 0 },
    dueDate: { type: Date, required: true },
    status: { 
        type: String, 
        enum: ['Pending', 'Partial', 'Paid', 'Overdue'],
        default: 'Pending'
    },
    paymentHistory: [{
        amount: Number,
        date: { type: Date, default: Date.now },
        method: String
    }]
}, { timestamps: true });

export default mongoose.model('Fee', feeSchema);