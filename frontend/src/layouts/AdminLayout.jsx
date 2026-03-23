// frontend/src/layouts/AdminLayout.jsx
import React, { useState } from "react";
import Sidebar from "../components/admin/Sidebar.jsx";
import useAuthStore from "../state/authStore.js";
import { Menu } from "lucide-react"; // Import Menu icon

const AdminLayout = ({ children }) => {
  const { user } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-neutral-bg-subtle">

      {/* SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <Sidebar />
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* MAIN CONTENT */}
      <div className="flex-1 md:ml-64 p-8">
        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-gray-600 focus:outline-none focus:bg-gray-100 absolute top-4 left-4 z-50"
          onClick={toggleSidebar}
        >
          <Menu size={24} />
        </button>

        <div className="mb-6 mt-10 md:mt-0">
          <h1 className="text-3xl font-bold text-primary-900">
            Welcome, {user?.name || "Admin"}
          </h1>
          <p className="text-gray-600">Manage your school operations</p>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
};

export default AdminLayout;
