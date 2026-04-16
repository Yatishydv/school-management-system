import mongoose from 'mongoose';

const salarySchema = new mongoose.Schema({
    teacher: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    month: { 
        type: String, 
        required: true 
    },
    year: { 
        type: Number, 
        required: true 
    },
    baseSalary: { 
        type: Number, 
        required: true 
    },
    bonus: { 
        type: Number, 
        default: 0 
    },
    deductions: { 
        type: Number, 
        default: 0 
    },
    paidAmount: { 
        type: Number, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['Pending', 'Partial', 'Paid'], 
        default: 'Pending' 
    },
    paymentDate: { 
        type: Date 
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Bank Transfer', 'Cheque', 'Other'],
        default: 'Bank Transfer'
    },
    remarks: { 
        type: String 
    },
    invoiceNumber: {
        type: String,
        unique: true
    }
}, { timestamps: true });

export default mongoose.model('Salary', salarySchema);
