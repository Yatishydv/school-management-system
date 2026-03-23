// frontend/src/pages/public/AdmissionsPage.jsx
import React, { useState } from "react";
import axios from "axios";
import Button from "../../components/ui/Button";
import schoolImage from "../../assets/school.png";

const AdmissionsPage = () => {
  const [form, setForm] = useState({
    studentName: "",
    fatherName: "",
    motherName: "",
    dob: "",
    classApplied: "",
    phone: "",
    email: "",
    address: "",
    prevSchool: "",
  });

  const [photo, setPhoto] = useState(null);
  const [birthCertificate, setBirthCertificate] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitForm = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    if (photo) data.append("photo", photo);
    if (birthCertificate) data.append("birthCertificate", birthCertificate);

    await axios.post("/api/admissions/submit", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    alert("Admission Form Submitted Successfully!");
  };

  return (
    <div className="min-h-screen bg-neutral-bg-subtle text-gray-800">

      {/* HERO SECTION */}
      <header
        className="relative h-[60vh] flex items-center justify-center text-center"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(2,6,23,0.4), rgba(2,6,23,0.7)), url(${schoolImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white">
          Admissions Open 2025
        </h1>
      </header>

      {/* INTRO */}
      <section className="py-16 px-6 max-w-5xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-primary-900 mb-4">
          Start Your Child’s Journey With Us
        </h2>
        <p className="text-gray-700 text-lg max-w-3xl mx-auto">
          We welcome curious, creative and disciplined students.  
          Our admission process is simple and transparent.
        </p>
      </section>

      {/* ADMISSION PROCESS */}
      <section className="py-10 px-6 bg-white border-y border-gray-100">
        <h3 className="text-2xl font-bold text-center text-primary-900 mb-10">
          Admission Process
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            { num: "01", title: "Collect Prospectus", desc: "Visit the school office to collect admission prospectus." },
            { num: "02", title: "Submit Documents", desc: "Submit the required documents with the application form." },
            { num: "03", title: "Confirm Admission", desc: "Pay admission fees and secure your child's seat." },
          ].map((step, index) => (
            <div
              key={index}
              className="p-8 bg-neutral-bg-subtle rounded-xl shadow-sm border border-gray-200 text-center"
            >
              <div className="text-5xl font-extrabold text-accent-500 mb-4">{step.num}</div>
              <h4 className="text-xl font-semibold mb-2">{step.title}</h4>
              <p className="text-gray-700">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DOCUMENTS REQUIRED */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <h3 className="text-2xl font-bold text-primary-900 mb-6 text-center">
          Documents Required
        </h3>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700 text-lg">
          <li>• Birth Certificate</li>
          <li>• Aadhar Card (Student + Parents)</li>
          <li>• 4 Passport Size Photos</li>
          <li>• Transfer Certificate (if applicable)</li>
          <li>• Previous Report Card</li>
        </ul>
      </section>

      {/* ADMISSION FORM */}
      <section className="py-20 px-6 bg-white">
        <h2 className="text-3xl font-bold text-center text-primary-900 mb-10">
          Online Admission Form
        </h2>

        <form
          onSubmit={submitForm}
          className="max-w-3xl mx-auto bg-neutral-bg-subtle p-10 rounded-xl shadow-lg border border-gray-200 grid gap-6"
        >
          {[
            { name: "studentName", label: "Student Name" },
            { name: "fatherName", label: "Father Name" },
            { name: "motherName", label: "Mother Name" },
            { name: "dob", label: "Date of Birth", type: "date" },
            { name: "classApplied", label: "Class Applying For" },
            { name: "phone", label: "Phone Number" },
            { name: "email", label: "Email (Optional)" },
            { name: "address", label: "Address" },
            { name: "prevSchool", label: "Previous School (Optional)" },
          ].map((field, i) => (
            <input
              key={i}
              type={field.type || "text"}
              name={field.name}
              placeholder={field.label}
              onChange={handleChange}
              required={field.name !== "email" && field.name !== "prevSchool"}
              className="p-3 border rounded-lg bg-white"
            />
          ))}

          <div>
            <label className="font-semibold">Upload Photo</label>
            <input type="file" onChange={(e) => setPhoto(e.target.files[0])} />
          </div>

          <div>
            <label className="font-semibold">Upload Birth Certificate</label>
            <input type="file" onChange={(e) => setBirthCertificate(e.target.files[0])} />
          </div>

          <Button className="bg-accent-500 text-white py-3 px-8 rounded-lg">
            Submit Application
          </Button>
        </form>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center bg-white p-10 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-2xl md:text-3xl font-bold text-primary-900 mb-4">
            Need Help?
          </h3>
          <p className="text-gray-700 mb-6">
            Contact our school office between 9:00 AM – 2:00 PM for admission assistance.
          </p>

          <Button className="text-lg px-10 py-3 bg-accent-500 text-white hover:bg-accent-400 shadow-md">
            Call School Office
          </Button>
        </div>
      </section>
    </div>
  );
};

export default AdmissionsPage;
