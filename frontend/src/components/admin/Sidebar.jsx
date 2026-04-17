// frontend/src/components/admin/Sidebar.jsx
import React, { useState, useEffect } from "react";
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
  Shield,
  Layout,
  Activity,
  Award,
  DollarSign,
  Bell,
  CreditCard,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import useAuthStore from "../../stores/authStore.js";
import notificationService from "../../api/notificationService.js";

const Sidebar = () => {
  const { user, logout, token } = useAuthStore();
  const role = user?.role || "student";
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const notifications = await notificationService.getMyNotifications(token);
        const unread = notifications.filter(n => {
            if (n.targetType === 'User') return !n.isRead;
            return !n.readBy?.includes(user._id);
        }).length;
        setUnreadCount(unread);
      } catch (err) {
        // Silent fail for sidebar count
      }
    };

    if (token) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 60000); // Refresh every minute
      return () => clearInterval(interval);
    }
  }, [token, user?._id]);

  const menuConfig = {
    admin: [
      { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
      { name: "Students", icon: Users, path: "/admin/students" },
      { name: "Teachers", icon: GraduationCap, path: "/admin/teachers" },
      { name: "Classes", icon: BookOpen, path: "/admin/classes" },
      { name: "Subjects", icon: Layout, path: "/admin/subjects" },
      { name: "Admissions", icon: FileText, path: "/admin/admissions" },
      { name: "Timetable", icon: Calendar, path: "/admin/timetable" },
      { name: "Exams", icon: FileText, path: "/admin/exams" },
      { name: "Fees", icon: DollarSign, path: "/admin/fees" },
      { name: "Money Center", icon: TrendingUp, path: "/admin/revenue" },
      { name: "Bills & Payments", icon: TrendingDown, path: "/admin/expenses" },
      { name: "Salaries", icon: CreditCard, path: "/admin/salaries" },
      { name: "Site Editor", icon: LayoutDashboard, path: "/admin/site-editor" },
      { name: "Gallery", icon: Image, path: "/admin/gallery" },
      { name: "My Account", icon: Shield, path: "/admin/profile" },
    ],
    teacher: [
      { name: "Dashboard", icon: LayoutDashboard, path: "/teacher/dashboard" },
      { name: "Attendance", icon: Activity, path: "/teacher/attendance" },
      { name: "Classes", icon: BookOpen, path: "/teacher/classes" },
      { name: "Assignments", icon: FileText, path: "/teacher/assignments" },
      { name: "Results", icon: Award, path: "/teacher/results" },
      { name: "Salaries", icon: CreditCard, path: "/teacher/salaries" },
      { name: "Alert Hub", icon: Bell, path: "/teacher/notifications", badge: true },
    ],
    student: [
      { name: "Dashboard", icon: LayoutDashboard, path: "/student/dashboard" },
      { name: "Attendance", icon: Activity, path: "/student/attendance" },
      { name: "Subjects", icon: BookOpen, path: "/student/subjects" },
      { name: "Timetable", icon: Calendar, path: "/student/timetable" },
      { name: "Assignments", icon: FileText, path: "/student/assignments" },
      { name: "Results", icon: Award, path: "/student/results" },
      { name: "Fees", icon: DollarSign, path: "/student/fees" },
      { name: "Notifications", icon: Bell, path: "/student/notifications", badge: true },
    ],
  };

  const menu = menuConfig[role] || menuConfig.student;

  return (
    <div className="h-screen w-full bg-white border-r border-gray-100 p-8 flex flex-col relative overflow-hidden">
      {/* Brand Header */}
      <div className="relative z-10 mb-16 space-y-1">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-lg bg-primary-950 flex items-center justify-center shadow-lg">
              <Shield size={18} className="text-white" />
           </div>
           <span className="text-xl font-black tracking-tighter uppercase text-primary-950">HUB<span className="text-accent-500 italic">.</span></span>
        </div>
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] ml-1">Portal</p>
      </div>

      {/* Navigation - Scrollable */}
      <nav className="flex-1 space-y-1 relative z-10 overflow-y-auto pr-2 custom-scrollbar min-h-0">
        {menu.map((item) => {
          const Icon = item.icon;
          const hasBadge = item.badge && unreadCount > 0;
          
          return (
            <NavLink
              to={item.path}
              key={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 group ${
                  isActive
                    ? "bg-gray-50 text-accent-500 translate-x-1"
                    : "text-gray-400 hover:text-primary-950 hover:bg-gray-50"
                }`
              }
            >
              <div className="flex items-center gap-4 relative">
                <Icon size={18} className={`transition-all duration-300 ${location.pathname === item.path ? "text-accent-500" : "group-hover:text-primary-950"}`} />
                <span>{item.name}</span>
                {hasBadge && (
                    <span className="absolute -top-1 -left-1 w-4 h-4 bg-accent-500 text-white text-[8px] flex items-center justify-center rounded-full animate-bounce shadow-lg shadow-accent-500/20">
                        {unreadCount}
                    </span>
                )}
              </div>
              <div className={`w-1.5 h-1.5 rounded-full bg-accent-500 transition-opacity duration-300 ${location.pathname === item.path ? "opacity-100" : "opacity-0 group-hover:opacity-50"}`}></div>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Actions - Fixed bottom */}
      <div className="relative z-10 pt-8 mt-8 border-t border-gray-50 space-y-1 shrink-0">
        <NavLink
            to="/"
            className="flex items-center gap-4 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-primary-950 hover:bg-gray-50 transition-all"
        >
            <Home size={18} />
            <span>Public Site</span>
        </NavLink>

        <button
            onClick={logout}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-red-500 hover:bg-red-50 transition-all"
        >
            <LogOut size={18} />
            <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

const MailOpenIcon = ({ size, className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M21.2 8.4c.5.3.8.8.8 1.3v10c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V9.7c0-.5.3-1 .8-1.3l8-5a2 2 0 0 1 2.4 0l8 5Z"/>
        <path d="m22 9-10 7L2 9"/>
    </svg>
);

export default Sidebar;
