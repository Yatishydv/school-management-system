import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "../../api/axios";
import { Mail, ArrowLeft, Fingerprint } from "lucide-react";
import { toast } from "react-toastify";

const ForgotPassword = () => {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) return toast.error("Please enter your Unique ID.");

    try {
      setLoading(true);
      await axios.post("/auth/forgot-password", { identifier: identifier.trim() });
      setSubmitted(true);
      toast.success("Security verified. Check your email.");
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
          <p className="text-gray-600 mb-6 text-sm">
            If account <strong>{identifier}</strong> exists, we've sent a password reset link to the registered email address.
          </p>
          <Link
            to="/login"
            className="text-accent-500 hover:underline font-semibold flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-bg-subtle flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border animate-fade-in-up">
        <h1 className="text-3xl font-bold text-primary-900 mb-2">
          Forgot Password?
        </h1>

        <p className="text-gray-600 mb-6 text-sm">
          Enter your Unique ID and we'll send a link to your email to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Unique ID
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter your Unique ID"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full p-3 border rounded-xl mt-1 pr-10 outline-none focus:ring-2 focus:ring-accent-500 transition-all text-sm"
                required
              />
              <Fingerprint className="w-5 h-5 text-gray-400 absolute right-3 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              bg-accent-500
              hover:bg-accent-400
              text-white
              font-semibold
              py-3
              rounded-xl
              mt-2
              shadow-lg
              transition-all
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            {loading ? "Authorizing..." : "Send Reset Link"}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6 text-sm">
          Remember your password?{" "}
          <Link to="/login" className="text-accent-500 underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
