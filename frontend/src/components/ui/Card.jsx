import React from 'react';

const Card = ({ title, children, className = '', titleClassName = '' }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ${className}`}>
        {title && (
            <div className={`p-6 border-b border-gray-200 dark:border-gray-700 ${titleClassName}`}>
                <h2 className="text-2xl font-heading font-bold text-primary dark:text-white">{title}</h2>
            </div>
        )}
        <div className="p-6">
            {children}
        </div>
    </div>
);

export default Card;
