import React from 'react';

const Button = ({ children, className = '', variant = 'primary', onClick, disabled, type = "button" }) => {
    const baseStyle = 'px-8 py-4 font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all duration-500 ease-out transform hover:-translate-y-1 hover:shadow-2xl focus:outline-none disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none';

    const variants = {
        primary: 'bg-primary-950 text-white hover:bg-accent-500 shadow-xl shadow-primary-950/10',
        secondary: 'bg-white text-primary-950 border border-gray-100 hover:bg-gray-50 shadow-sm',
        accent: 'bg-accent-500 text-white hover:bg-accent-600 shadow-xl shadow-accent-500/20',
        destructive: 'bg-white text-red-500 border border-red-50 hover:bg-red-500 hover:text-white',
        ghost: 'bg-transparent text-primary-950 hover:bg-gray-50',
    };

    return (
        <button
            type={type}
            className={`${baseStyle} ${variants[variant] || variants.primary} ${className}`}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

export default Button;
