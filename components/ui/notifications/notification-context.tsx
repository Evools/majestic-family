'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import { Toast, ToastType } from './toast';

interface ToastData {
  id: string;
  type?: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface NotificationContexttype {
  addToast: (toast: Omit<ToastData, 'id'>) => void;
  removeToast: (id: string) => void;
}

const NotificationContext = createContext<NotificationContexttype | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-0 right-0 z-100 flex flex-col gap-2 p-4 sm:p-6 md:max-w-[420px] w-full pointer-events-none">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onDismiss={removeToast}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useToast() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a NotificationProvider');
  }
  return context;
}
