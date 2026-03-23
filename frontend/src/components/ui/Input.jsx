import React from "react";

const Input = React.forwardRef(
  ({ type = "text", placeholder, value, onChange, className = "", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      placeholder={placeholder}
      value={value || ""}
      onChange={onChange}
      className={`w-full px-4 py-3 font-sans border border-gray-300 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-300 ${className}`}
      {...props}
    />
  )
);

Input.displayName = "Input";

export default Input;
