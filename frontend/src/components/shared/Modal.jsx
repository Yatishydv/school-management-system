// frontend/src/components/shared/Modal.jsx
import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { X } from "lucide-react";

/**
 * Premium Portal Modal Component
 * Ensures the modal is always on top (using React Portal)
 */
const Modal = ({ isOpen, onClose, title, children, size = "md", wide = false, hideHeader = false }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl",
  };

  const effectiveSize = wide ? sizeClasses["6xl"] : (sizeClasses[size] || sizeClasses.md);

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 md:p-8 animate-fade-in shadow-2xl">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-primary-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className={`relative bg-white w-full ${effectiveSize} min-h-[200px] max-h-[85vh] overflow-hidden rounded-3xl sm:rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] border border-gray-100 flex flex-col animate-fade-up`}>
        
        {!hideHeader && (
          <div className="p-6 md:p-8 border-b border-gray-100 flex justify-between items-center shrink-0 bg-white">
             <div className="space-y-1">
                <h2 className="text-xl md:text-2xl font-black tracking-tighter text-primary-950 uppercase italic">{title}</h2>
                <div className="w-10 h-1 rounded-full bg-accent-500"></div>
             </div>
             <button 
               onClick={onClose} 
               className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-50 text-gray-400 hover:bg-primary-950 hover:text-white transition-all flex items-center justify-center border border-gray-100"
             >
               <X size={20} />
             </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white overscroll-contain min-h-0">
           {children}
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default Modal;
