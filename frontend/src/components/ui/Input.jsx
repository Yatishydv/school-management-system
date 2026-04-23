import React from "react";

const Input = React.forwardRef(
  ({ label, type = "text", placeholder, className = "", error, ...props }, ref) => (
    <div className="space-y-2 w-full group">
      {label && (
        <label className="text-[13px] font-semibold text-gray-500 block ml-1 group-focus-within:text-accent-600 transition-colors">
          {label}
        </label>
      )}
      <div className="relative">
        <input
            ref={ref}
            type={type}
            placeholder={placeholder}
            className={`w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-accent-500/5 focus:border-accent-500 transition-all font-medium text-sm text-primary-950 outline-none placeholder:text-gray-400 shadow-sm hover:border-gray-300 ${error ? "border-red-500 ring-4 ring-red-50" : ""} ${className}`}
            {...props}
        />
      </div>
      {error && <p className="text-xs font-medium text-red-500 ml-1">{error}</p>}
    </div>
  )
);

Input.displayName = "Input";

export default Input;
