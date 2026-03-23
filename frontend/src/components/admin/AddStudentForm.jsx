import React, { useState } from "react";
import useAuthStore from "../../state/authStore";
import Input from "../ui/Input";
import Button from "../ui/Button";
import adminService from "../../api/adminService";

const AddStudentForm = ({ onClose, onUserAdded }) => {
  const { token } = useAuthStore();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    uniqueId: "",
    role: "student",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await adminService.addUser(formData, token);
      alert("Student added successfully!");
      onUserAdded();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add student.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-primary-900">Add New Student</h2>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <Input label="Name" name="name" value={formData.name} onChange={handleChange} required placeholder="Enter student's full name" className="mb-4" />
      <Input label="Student ID" name="uniqueId" value={formData.uniqueId} onChange={handleChange} required placeholder="Enter unique student ID" className="mb-4" />
      <Input label="Email" type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Enter student's email" className="mb-4" />
      <Input label="Password" type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Set a password for the student" className="mb-4" />

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={loading} variant="accent">
          {loading ? "Adding..." : "Add Student"}
        </Button>
      </div>
    </form>
  );
};

export default AddStudentForm;
