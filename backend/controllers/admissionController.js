import Admission from "../models/Admission.js";

export const submitAdmission = async (req, res) => {
  try {
    const data = req.body;

    // If files uploaded
    if (req.files) {
      if (req.files.photo) {
        data.photo = `/uploads/${req.files.photo[0].filename}`;
      }
      if (req.files.birthCertificate) {
        data.birthCertificate = `/uploads/${req.files.birthCertificate[0].filename}`;
      }
    }

    const admission = new Admission(data);
    await admission.save();

    res.status(201).json({ message: "Admission submitted", success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error", success: false });
  }
};

export const getAdmissions = async (req, res) => {
  try {
    const data = await Admission.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data });
  } catch {
    res.status(500).json({ success: false });
  }
};
