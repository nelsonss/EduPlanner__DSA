
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 dark:bg-brand-dark-accent dark:shadow-none dark:border dark:border-gray-700 ${className}`}>
      {children}
    </div>
  );
};

export default Card;