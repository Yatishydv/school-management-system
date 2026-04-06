// frontend/src/pages/public/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../../api/axios";
import useAuthStore from "../../stores/authStore";
import { User, EyeOff, Eye } from "lucide-react";
import { toast } from "react-toastify";

const API_URL = "/auth/login"; // Use relative path as base URL is set in axios instance

const LoginPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const [form, setForm] = useState({
    uniqueId: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const roleRedirect = {
    admin: "/admin/dashboard",
    teacher: "/teacher/dashboard",
    student: "/student/dashboard",
  };

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const submitLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.uniqueId.trim()) return setError("Please enter your Unique ID.");
    if (!form.password.trim()) return setError("Please enter your password.");

    try {
      setLoading(true);

      const res = await axios.post(API_URL, {
        uniqueId: form.uniqueId.trim(),
        password: form.password.trim(),
      });

      const data = res.data;

      if (!data?.token) {
        setError("Invalid server response.");
        return;
      }

      setAuth({
        token: data.token,
        user: {
          _id: data._id,
          name: data.name,
          uniqueId: data.uniqueId,
          email: data.email,
          role: data.role,
          profileImage: data.profileImage,
          address: data.address,
          phone: data.phone,
          rollNumber: data.rollNumber,
          classId: data.classId,
        },
      });

      axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

      toast.success("Login successful! Welcome back.", {
        autoClose: 3000,
      });
      
      console.log("Redirecting to:", roleRedirect[data.role], "for role:", data.role);
      navigate(roleRedirect[data.role] || "/", { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || "Invalid ID or password.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-bg-subtle flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border animate-fade-in-up">
        <h1 className="text-3xl font-bold text-primary-900 mb-2">
          Login to Your Account
        </h1>

        <p className="text-gray-600 mb-6 text-sm">
          Enter your Unique ID and Password to continue.
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 mb-4 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={submitLogin} className="space-y-4">

          {/* Unique ID */}
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Unique ID
            </label>
            <div className="relative">
              <input
                type="text"
                name="uniqueId"
                placeholder="Enter your unique ID"
                onChange={handleChange}
                className="w-full p-3 border rounded-xl mt-1 pr-10"
              />
              <User className="w-5 h-5 text-gray-400 absolute right-3 top-3.5" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                name="password"
                placeholder="Enter password"
                onChange={handleChange}
                className="w-full p-3 border rounded-xl mt-1 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-3.5 text-gray-500"
              >
                {showPwd ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="flex justify-end text-sm">
            <Link to="/forgot-password" className="text-accent-500 hover:underline">
              Forgot Password?
            </Link>
          </div>

          {/* Login Button — THEME MATCHED */}
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
            {loading ? "Signing in..." : "Login"}
          </button>

        </form>

        <p className="text-center text-gray-600 mt-6 text-sm">
          Need help?{" "}
          <Link to="/contact" className="text-accent-500 underline">
            Contact School
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
