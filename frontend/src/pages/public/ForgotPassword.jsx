
import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "../../api/axios";
import { Mail, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";

const ForgotPassword = () => {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) return toast.error("Please enter your Email or Unique ID.");

    try {
      setLoading(true);
      await axios.post("/auth/forgot-password", { identifier: identifier.trim() });
      setSubmitted(true);
      toast.success("Reset link sent! Please check your email.");
    } catch (err) {
      const msg = err?.response?.data?.message || "Something went wrong. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-neutral-bg-subtle flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border text-center animate-fade-in">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h1>
          <p className="text-gray-600 mb-6">
            If an account exists for <strong>{identifier}</strong>, we've sent a password reset link to the registered email address.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center text-accent-500 hover:underline font-semibold"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-bg-subtle flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border animate-fade-in-up">
        <Link
          to="/login"
          className="inline-flex items-center text-gray-500 hover:text-gray-700 text-sm mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Login
        </Link>

        <h1 className="text-3xl font-bold text-primary-900 mb-2">Forgot Password?</h1>
        <p className="text-gray-600 mb-8 text-sm">
          Enter your **Email Address** or **Unique ID** below and we'll send a link to your registered email to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-semibold text-gray-700">Email or Unique ID</label>
            <div className="relative mt-1">
              <input
                type="text"
                placeholder="e.g. admin001 or mail@example.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full p-3 border rounded-xl pr-10 focus:ring-2 focus:ring-accent-500 focus:border-transparent outline-none transition-all"
                required
              />
              <Mail className="w-5 h-5 text-gray-400 absolute right-3 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent-500 hover:bg-accent-400 text-white font-semibold py-3 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending link..." : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
