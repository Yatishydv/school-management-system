import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    uniqueId: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, unique: true, sparse: true }, 
    role: { 
        type: String, 
        enum: ['admin', 'teacher', 'student'], 
        required: true 
    },
    name: { type: String, required: true },
    phone: { type: String },
    address: { type: String },
    profileImage: { type: String },
    
    // Teacher Fields
    assignedClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
    
    // Student Fields
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' }, 
    rollNumber: { type: String },
    fatherName: { type: String },
    motherName: { type: String },
    dob: { type: String },
    prevSchool: { type: String },
    admissionDate: { type: Date, default: Date.now }
}, { timestamps: true });

// Pre-save middleware for hashing password
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
