// frontend/src/layouts/AdminLayout.jsx
import React, { useState } from "react";
import Sidebar from "../components/admin/Sidebar.jsx";
import useAuthStore from "../stores/authStore.js";
import { Menu, X } from "lucide-react";

const AdminLayout = ({ children }) => {
  const { user } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-white md:bg-gray-50/50 overflow-x-hidden">

      {/* SIDEBAR - Fixed Desktop, Drawer Mobile */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 transition-transform duration-500 ease-out shadow-2xl md:shadow-none`}>
        <Sidebar />
        
        {/* Mobile Close Button */}
        <button 
          onClick={toggleSidebar}
          className="md:hidden absolute top-6 -right-12 w-10 h-10 bg-white border border-gray-100 text-primary-950 rounded-r-xl flex items-center justify-center shadow-xl"
        >
          <X size={20} />
        </button>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-primary-950/20 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* MAIN CONTENT */}
      <div className="flex-1 md:ml-72 md:max-w-[calc(100%-18rem)] min-h-screen relative overflow-x-hidden">
        {/* Mobile Header (Only visible on small screens) */}
        <div className="md:hidden flex items-center justify-between p-6 bg-white border-b sticky top-0 z-30">
           <div className="text-lg font-black tracking-tighter uppercase text-primary-950">HUB<span className="text-accent-500 italic">.</span></div>
           <button
             className="p-3 text-primary-950 bg-gray-50 rounded-xl"
             onClick={toggleSidebar}
           >
             <Menu size={24} />
           </button>
        </div>

        {/* Page Content */}
        <div className="animate-fade-in">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
