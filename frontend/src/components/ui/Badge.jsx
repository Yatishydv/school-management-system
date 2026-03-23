import React from 'react';

const Badge = ({ children, variant = 'default', className = '' }) => {
    let baseStyle = 'inline-flex items-center px-3 py-1 text-xs font-medium rounded-full';
    if (variant === 'default') baseStyle += ' bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white';
    if (variant === 'success') baseStyle += ' bg-success/20 text-success';
    if (variant === 'warning') baseStyle += ' bg-warning/20 text-warning';
    if (variant === 'destructive') baseStyle += ' bg-danger/20 text-danger';

    return <span className={`${baseStyle} ${className}`}>{children}</span>;
};

export default Badge;