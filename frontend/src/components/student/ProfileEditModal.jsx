import React, { useState } from "react";
import { X, User, Mail, Phone, MapPin, Shield } from "lucide-react";

const ProfileEditModal = ({ isOpen, onClose, profile }) => {
  const [formData] = useState({
    name: profile?.name || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
    address: profile?.address || "",
  });
  const [previewUrl] = useState(profile?.profileImage ? `http://localhost:5005/${profile.profileImage}` : null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-primary-950/40 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose}
      ></div>
      
      <div className="bg-white w-full max-w-2xl rounded-[1.5rem] overflow-hidden shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 border border-white/10 max-h-[85vh] flex flex-col">
        {/* Compact Header */}
        <div className="px-6 py-4 flex justify-between items-center bg-gray-50/50 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-blue-600" />
            <h3 className="text-sm font-black text-primary-950 uppercase tracking-tighter italic">Institutional Archive</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto custom-scrollbar">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Left Column: Avatar & Security Status */}
            <div className="md:w-1/3 flex flex-col items-center text-center gap-4 md:sticky md:top-0">
               <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-xl bg-blue-50 flex items-center justify-center overflow-hidden">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover grayscale-[0.2]" />
                  ) : (
                    <User size={40} className="text-blue-200" />
                  )}
               </div>
               <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 font-black">Identity Locked</p>
                  <p className="text-[9px] font-medium text-gray-400 italic leading-snug">Administrative credentials required for modification.</p>
               </div>
            </div>

            {/* Right Column: Data Grid */}
            <div className="md:w-2/3 grid grid-cols-1 gap-4 w-full">
              {[
                { label: "Identity Name", val: formData.name, icon: User },
                { label: "Official Email", val: formData.email, icon: Mail },
                { label: "Direct Line", val: formData.phone || "N/A", icon: Phone },
                { label: "Permanent Residence", val: formData.address || "N/A", icon: MapPin }
              ].map(({ label, val, icon: Icon }, idx) => (
                <div key={idx} className="space-y-1">
                  <label className="text-[8px] font-black uppercase tracking-widest text-gray-300 ml-1">{label}</label>
                  <div className="relative group text-gray-400">
                    <Icon className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={12} />
                    <input 
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50/30 rounded-lg border border-gray-100 font-bold text-[11px] cursor-not-allowed"
                      value={val}
                      readOnly
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Consolidated Policy Directive */}
          <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between gap-4">
             <div className="flex items-center gap-1.5 shrink-0">
                <Shield size={12} className="text-blue-500/50" />
                <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Governance Active</p>
             </div>
             <p className="text-[9px] font-bold text-gray-400 uppercase italic tracking-tighter text-right">
                Records Locked. Visit Administrative Office for updates.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditModal;
