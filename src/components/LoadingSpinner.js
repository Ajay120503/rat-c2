import React from 'react';
import { FiLoader } from 'react-icons/fi';

export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
  };

  return (
    <div className={`flex justify-center py-12 ${className}`}>
      <FiLoader className={`animate-spin text-primary-500 ${sizeClasses[size] || sizeClasses.md}`} />
    </div>
  );
}