import React from "react";

const Input = React.forwardRef(
  ({ label, type = "text", placeholder, className = "", error, ...props }, ref) => (
    <div className="space-y-2 w-full">
      {label && (
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block ml-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        className={`w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-accent-100 focus:border-accent-500 transition-all font-bold text-sm outline-none placeholder:text-gray-300 shadow-sm ${error ? "border-red-500 ring-4 ring-red-50" : ""} ${className}`}
        {...props}
      />
      {error && <p className="text-[10px] font-bold text-red-500 ml-1">{error}</p>}
    </div>
  )
);

Input.displayName = "Input";

export default Input;
