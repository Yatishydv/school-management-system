import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    uniqueId: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, sparse: true }, // Removed UNIQ to allow siblings sharing email
    role: { 
        type: String, 
        enum: ['admin', 'teacher', 'student'], 
        required: true 
    },
    name: { type: String, required: true },
    phone: { type: String },
    address: { type: String },
    profileImage: { type: String },

    // Personal / Social Details (Mainly for Admin/Teachers)
    bio: { type: String },
    personalEmail: { type: String },
    secondaryPhone: { type: String },
    socialLinks: {
        whatsapp: { type: String },
        instagram: { type: String },
        facebook: { type: String },
        twitter: { type: String }
    },
    
    // Teacher Fields
    assignedClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
    
    // Student Fields
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' }, 
    rollNumber: { type: String },
    fatherName: { type: String },
    motherName: { type: String },
    dob: { type: String },
    prevSchool: { type: String },
    admissionDate: { type: Date, default: Date.now },

    // Demographic and Identification (Common)
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    religion: { type: String },
    category: { type: String }, // General, OBC, SC, ST etc
    aadharNumber: { type: String },
    emergencyContact: { type: String },

    // Teacher / Professional Fields
    qualification: { type: String },
    experience: { type: String },

    // Reset Password Fields
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date }
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
