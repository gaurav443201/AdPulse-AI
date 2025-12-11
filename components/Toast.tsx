import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-brand-600',
    warning: 'bg-orange-500'
  };

  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    info: 'fa-info-circle',
    warning: 'fa-triangle-exclamation'
  };

  return (
    <div className={`fixed bottom-6 right-6 ${bgColors[type]} text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-slide-up z-50 min-w-[300px]`}>
      <i className={`fas ${icons[type]} text-lg`}></i>
      <span className="font-medium text-sm">{message}</span>
      <button onClick={onClose} className="ml-auto text-white/80 hover:text-white">
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
};

export default Toast;