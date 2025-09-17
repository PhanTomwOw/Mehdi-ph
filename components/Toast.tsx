import React, { useEffect } from 'react';
import { CheckCircleIcon } from './IconComponents';

interface ToastProps {
  message: string;
  show: boolean;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, show, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Auto-dismiss after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <div 
      className={`fixed top-5 left-5 z-[100] transition-all duration-300 ease-in-out
        ${show ? 'transform translate-y-0 opacity-100' : 'transform -translate-y-10 opacity-0 pointer-events-none'}
      `}
      role="alert"
      aria-live="assertive"
    >
        <div className="flex items-center bg-primary text-primary-foreground text-sm font-semibold px-4 py-3 rounded-lg shadow-2xl">
          <CheckCircleIcon className="w-6 h-6 ms-3" />
          <p>{message}</p>
        </div>
    </div>
  );
};

export default Toast;