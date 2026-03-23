// frontend/src/components/admin/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  FileText,
  Image,
  GraduationCap,
  LogOut,
  Home,
} from "lucide-react";
import useAuthStore from "../../state/authStore.js";

const Sidebar = () => {
  const logout = useAuthStore((state) => state.logout);

  const menu = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
    { name: "Students", icon: Users, path: "/admin/students" },
    { name: "Teachers", icon: GraduationCap, path: "/admin/teachers" },
    { name: "Classes", icon: BookOpen, path: "/admin/classes" },
    { name: "Timetable", icon: Calendar, path: "/admin/timetable" },
    { name: "Exams", icon: FileText, path: "/admin/exams" },
    { name: "Gallery", icon: Image, path: "/admin/gallery" },
  ];

  return (
    <div className="h-screen w-64 fixed left-0 top-0 bg-white border-r shadow-sm p-6 flex flex-col">
      
      <div className="text-2xl font-bold mb-10 text-primary-900">
        School<span className="text-accent-500">Admin</span>
      </div>

      <nav className="flex-1 space-y-2">
        {menu.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              to={item.path}
              key={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                  isActive
                    ? "bg-primary-100 text-primary-900"
                    : "text-gray-600 hover:bg-gray-100"
                }`
              }
            >
              <Icon size={20} />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
            isActive
              ? "bg-primary-100 text-primary-900"
              : "text-gray-600 hover:bg-gray-100"
          }`
        }
      >
        <Home size={20} /> {/* Using Home icon for home */}
        Home Page
      </NavLink>

      <button
        onClick={logout}
        className="mt-6 flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 border border-red-300 hover:bg-red-50"
      >
        <LogOut size={20} />
        Logout
      </button>
    </div>
  );
};

export default Sidebar;
