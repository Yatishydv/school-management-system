import React from 'react';

const Button = ({ children, className = '', variant = 'primary', onClick, disabled }) => {
    const baseStyle = 'px-6 py-3 font-sans font-semibold rounded-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-opacity-50';

    const variants = {
        primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary-light',
        secondary: 'bg-secondary text-gray-800 hover:bg-secondary-dark focus:ring-secondary-light',
        neutral: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400',
        destructive: 'bg-danger text-white hover:bg-red-700 focus:ring-red-300', // Using default red for destructive for now
        ghost: 'bg-transparent text-primary hover:bg-gray-100 focus:ring-gray-200',
        accent: 'bg-accent text-white hover:bg-accent-dark focus:ring-accent-light', // Added accent variant
    };

    const disabledStyle = 'opacity-50 cursor-not-allowed';

    return (
        <button
            className={`${baseStyle} ${variants[variant]} ${disabled ? disabledStyle : ''} ${className}`}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

export default Button;
