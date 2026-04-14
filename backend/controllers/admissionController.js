import Admission from "../models/Admission.js";

export const submitAdmission = async (req, res) => {
  try {
    const data = req.body;

    // If files uploaded
    if (req.files) {
      if (req.files.photo) {
        data.photo = `/uploads/photo/${req.files.photo[0].filename}`;
      }
      if (req.files.birthCertificate) {
        data.birthCertificate = `/uploads/birthCertificate/${req.files.birthCertificate[0].filename}`;
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

export const updateAdmissionStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const admission = await Admission.findByIdAndUpdate(id, { status }, { new: true });
    if (!admission) return res.status(404).json({ message: "Admission record not found" });
    res.status(200).json({ success: true, message: `Status updated to ${status}`, data: admission });
  } catch (err) {
    res.status(500).json({ message: "Error updating status", success: false });
  }
};

export const deleteAdmission = async (req, res) => {
  const { id } = req.params;
  try {
    const admission = await Admission.findByIdAndDelete(id);
    if (!admission) return res.status(404).json({ message: "Admission record not found" });
    res.status(200).json({ success: true, message: "Admission record deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting record", success: false });
  }
};
