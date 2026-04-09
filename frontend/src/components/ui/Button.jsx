import React from 'react';

const Button = ({ children, className = '', variant = 'primary', size = 'md', onClick, disabled, type = "button" }) => {
    const baseStyle = 'font-black uppercase tracking-widest rounded-2xl transition-all duration-500 ease-out transform focus:outline-none disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none inline-flex items-center justify-center';

    const sizes = {
        sm: 'px-6 py-2.5 text-[11px] hover:-translate-y-0.5 active:scale-95',
        md: 'px-8 py-4 text-[12px] hover:-translate-y-1',
        lg: 'px-12 py-6 text-[14px] hover:-translate-y-1.5 shadow-2xl',
    };

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
            className={`${baseStyle} ${sizes[size] || sizes.md} ${variants[variant] || variants.primary} ${className}`}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

export default Button;
