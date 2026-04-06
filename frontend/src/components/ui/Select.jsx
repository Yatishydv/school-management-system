import React from "react";

const Select = React.forwardRef(
  ({ label, children, className = "", error, ...props }, ref) => (
    <div className="space-y-2 w-full">
      {label && (
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={`w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-accent-100 focus:border-accent-500 transition-all font-bold text-sm outline-none appearance-none cursor-pointer ${error ? "border-red-500 ring-4 ring-red-50" : ""} ${className}`}
          {...props}
        >
          {children}
        </select>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>
      {error && <p className="text-[10px] font-bold text-red-500 ml-1">{error}</p>}
    </div>
  )
);

Select.displayName = "Select";

export default Select;
