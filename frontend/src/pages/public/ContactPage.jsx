// frontend/src/pages/public/ContactPage.jsx
import React, { useState } from "react";
import axios from "axios";
import Button from "../../components/ui/Button";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";

const ContactPage = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitForm = async (e) => {
    e.preventDefault();

    try {
      await axios.post("/api/contact/send", form);
      alert("Message sent to school successfully!");
    } catch (err) {
      alert("Failed to send message, try again.");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-bg-subtle text-gray-900">

      {/* HERO SECTION */}
      <header
        className="relative h-[50vh] flex items-center justify-center text-center"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, rgba(2,6,23,0.4), rgba(2,6,23,0.7)), url('https://images.unsplash.com/photo-1588072432836-e10032774350')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl text-white font-extrabold">
          Contact Us
        </h1>
      </header>

      {/* QUICK INFO CARDS */}
      <section className="py-16 px-6 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Phone Card */}
        <div className="bg-white p-8 rounded-xl shadow border border-gray-100">
          <Phone className="w-10 h-10 text-accent-500 mb-4" />
          <h3 className="text-xl font-bold mb-2">Phone</h3>
          <p className="text-gray-700">School Office: +91 98765 43210</p>
          <p className="text-gray-700">Admin Desk: +91 88001 23456</p>
          <p className="text-gray-700">Emergency: +91 99999 11222</p>
        </div>

        {/* Email Card */}
        <div className="bg-white p-8 rounded-xl shadow border border-gray-100">
          <Mail className="w-10 h-10 text-accent-500 mb-4" />
          <h3 className="text-xl font-bold mb-2">Email</h3>
          <p className="text-gray-700">info@sbsschool.com</p>
          <p className="text-gray-700">admissions@sbsschool.com</p>
          <p className="text-gray-700">support@sbsschool.com</p>
        </div>

        {/* Timings Card */}
        <div className="bg-white p-8 rounded-xl shadow border border-gray-100">
          <Clock className="w-10 h-10 text-accent-500 mb-4" />
          <h3 className="text-xl font-bold mb-2">Office Timings</h3>
          <p className="text-gray-700">Mon – Fri: 9:00 AM – 3:00 PM</p>
          <p className="text-gray-700">Saturday: 9:00 AM – 12:00 PM</p>
          <p className="text-gray-700">Sunday: Closed</p>
        </div>

      </section>

      {/* LOCATION SECTION */}
      <section className="py-16 px-6 bg-white">

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start">

          <div>
            <h2 className="text-3xl font-bold text-primary-900 mb-4">
              Our Campus Location
            </h2>

            <p className="text-lg text-gray-700 max-w-md mb-4 leading-relaxed">
              S.B.S. Senior Secondary School  
              Village Badhwana,  
              Tehsil Dadri,  
              District Charkhi Dadri, Haryana – 127308
            </p>

            <div className="flex items-start gap-3 mb-3">
              <MapPin className="w-6 h-6 text-accent-500" />
              <p className="text-gray-700">Located in the center of Badhwana village</p>
            </div>

            <div className="flex items-start gap-3 mb-3">
              <MapPin className="w-6 h-6 text-accent-500" />
              <p className="text-gray-700">2 km from Charkhi Dadri – Badhwana main road</p>
            </div>

            <div className="flex items-start gap-3 mb-3">
              <MapPin className="w-6 h-6 text-accent-500" />
              <p className="text-gray-700">Nearest town: Charkhi Dadri (approx. 10 km)</p>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-6 h-6 text-accent-500" />
              <p className="text-gray-700">Local bus & shared vehicles available from Dadri</p>
            </div>
          </div>

          {/* GOOGLE MAP */}
          <iframe
            title="School Location Map"
            className="w-full h-80 rounded-xl shadow border"
            loading="lazy"
            allowFullScreen
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2246.22632576644!2d76.1692249157583!3d28.464696295986987!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39129399e7dbf75d%3A0x566aaa0f0fa17190!2sS.%20B.%20S.%20Senior%20Secondary%20School!5e0!3m2!1sen!2sin!4v1700500000000"
          ></iframe>

        </div>

      </section>

      {/* CONTACT FORM */}
      <section className="py-20 px-6">
        <h2 className="text-3xl text-center font-bold text-primary-900 mb-10">
          Send Us a Message
        </h2>

        <form
          onSubmit={submitForm}
          className="max-w-3xl mx-auto bg-white p-10 rounded-xl shadow-lg border grid gap-6"
        >
          <input
            className="p-3 border rounded-lg"
            type="text"
            name="name"
            placeholder="Your Name"
            onChange={handleChange}
            required
          />

          <input
            className="p-3 border rounded-lg"
            type="email"
            name="email"
            placeholder="Your Email"
            onChange={handleChange}
            required
          />

          <input
            className="p-3 border rounded-lg"
            type="text"
            name="phone"
            placeholder="Phone Number"
            onChange={handleChange}
            required
          />

          <input
            className="p-3 border rounded-lg"
            type="text"
            name="subject"
            placeholder="Subject"
            onChange={handleChange}
            required
          />

          <textarea
            className="p-3 border rounded-lg"
            name="message"
            rows="5"
            placeholder="Your Message"
            onChange={handleChange}
            required
          ></textarea>

          <Button className="bg-accent-500 text-white py-3 px-8 rounded-lg">
            Send Message
          </Button>
        </form>
      </section>

      {/* SOCIAL MEDIA */}
      <section className="py-16 px-6 bg-neutral-bg-subtle text-center">
        <h2 className="text-2xl font-bold mb-6">Connect With Us</h2>

        <div className="flex justify-center gap-6">
          <Facebook className="w-8 h-8 text-primary-900 hover:text-accent-500 cursor-pointer" />
          <Instagram className="w-8 h-8 text-primary-900 hover:text-accent-500 cursor-pointer" />
          <Twitter className="w-8 h-8 text-primary-900 hover:text-accent-500 cursor-pointer" />
        </div>
      </section>

      {/* ADMIN CONTACTS */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">

          <div className="p-8 bg-neutral-bg-subtle rounded-xl shadow border">
            <h3 className="text-xl font-bold mb-3 text-primary-900">Principal</h3>
            <p className="text-gray-700">Mr. Sanjay Sharma</p>
            <p className="text-gray-700">Phone: +91 99000 12345</p>
            <p className="text-gray-700">Email: principal@sbsschool.com</p>
          </div>

          <div className="p-8 bg-neutral-bg-subtle rounded-xl shadow border">
            <h3 className="text-xl font-bold mb-3 text-primary-900">Admin Office</h3>
            <p className="text-gray-700">Mrs. Neelam Verma</p>
            <p className="text-gray-700">Phone: +91 88001 23456</p>
            <p className="text-gray-700">Email: admin@sbsschool.com</p>
          </div>

        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-20 px-6">
        <h2 className="text-3xl font-bold text-center mb-10 text-primary-900">
          Frequently Asked Questions
        </h2>

        <div className="max-w-4xl mx-auto space-y-6">
          <div className="p-6 bg-white rounded-xl shadow border">
            <h3 className="text-xl font-bold mb-2">How can I apply for admission?</h3>
            <p className="text-gray-700">
              You can apply online through the admission form or visit the school office.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow border">
            <h3 className="text-xl font-bold mb-2">What are office timings?</h3>
            <p className="text-gray-700">
              Monday to Friday, 9 AM to 3 PM. Saturday until 12 PM.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow border">
            <h3 className="text-xl font-bold mb-2">Is transport available?</h3>
            <p className="text-gray-700">
              Yes! We provide safe and reliable transport across the region.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default ContactPage;
