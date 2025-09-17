import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-4',
    lg: 'h-16 w-16 border-4',
  };
  
  const containerClass = size === 'sm' ? '' : 'py-10';

  return (
    <div className={`flex justify-center items-center ${containerClass} ${className}`}>
      <div className={`animate-spin rounded-full border-border border-t-primary ${sizeClasses[size]}`}></div>
    </div>
  );
};

export default Spinner;