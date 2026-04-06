import mongoose from "mongoose";

const admissionSchema = new mongoose.Schema(
  {
    studentName: { type: String, required: true },
    fatherName: { type: String, required: true },
    motherName: { type: String, required: true },
    dob: { type: String, required: true },
    classApplied: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String, required: true },
    prevSchool: { type: String },
    photo: { type: String }, // file URL
    birthCertificate: { type: String }, // file URL
    status: { type: String, enum: ['Pending', 'Admitted', 'Rejected'], default: 'Pending' },
  },
  { timestamps: true }
);

export default mongoose.model("Admission", admissionSchema);
