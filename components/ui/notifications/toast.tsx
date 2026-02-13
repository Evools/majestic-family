'use client';

import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type?: ToastType;
  title?: string;
  message: string;
  duration?: number;
  onDismiss: (id: string) => void;
}

const icons = {
  success: <CheckCircle2 className="w-5 h-5 text-green-500" />,
  error: <AlertCircle className="w-5 h-5 text-red-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
};

const styles = {
  success: 'bg-green-500/5 border-green-500/20',
  error: 'bg-red-500/5 border-red-500/20',
  warning: 'bg-yellow-500/5 border-yellow-500/20',
  info: 'bg-blue-500/5 border-blue-500/20',
};

export function Toast({ id, type = 'info', title, message, duration = 4000, onDismiss }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setIsVisible(true));

    // Auto dismiss
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onDismiss(id), 300); // Wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, id, onDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss(id), 300);
  };

  return (
    <div
      className={`
        pointer-events-auto w-full max-w-sm overflow-hidden rounded-xl border backdrop-blur-xl shadow-2xl transition-all duration-300 ease-out
        ${styles[type]}
        ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95'}
      `}
      role="alert"
    >
      <div className="p-4 flex items-start gap-4">
        <div className={`p-2 rounded-full bg-white/5 border border-white/5 shrink-0`}>
            {icons[type]}
        </div>
        <div className="flex-1 pt-0.5">
          {title && <h4 className="text-sm font-bold text-white mb-1 tracking-tight">{title}</h4>}
          <p className="text-xs font-medium text-gray-400 leading-relaxed">{message}</p>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors -mr-1 -mt-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 overflow-hidden">
         <div 
            className={`h-full ${type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}`}
            style={{ 
                width: isVisible ? '0%' : '100%', 
                transition: `width ${duration}ms linear` 
            }} 
        />
      </div>
    </div>
  );
}
