import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    },
    category: { 
        type: String, 
        enum: ['Transport', 'Maintenance', 'Staff (Non-Teaching)', 'Utilities', 'Supplies', 'Events', 'Other'], 
        required: true 
    },
    amount: { 
        type: Number, 
        required: true 
    },
    date: { 
        type: Date, 
        default: Date.now 
    },
    description: { 
        type: String 
    },
    paidTo: { 
        type: String,
        required: true
    },
    vendorName: {
        type: String
    },
    vendorContact: {
        type: String
    },
    vendorVerification: {
        type: String // Aadhar, GST, or ID number
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Bank Transfer', 'Cheque', 'UPI', 'Other'],
        default: 'Cash'
    },
    referenceNumber: {
        type: String
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

export default mongoose.model('Expense', expenseSchema);
