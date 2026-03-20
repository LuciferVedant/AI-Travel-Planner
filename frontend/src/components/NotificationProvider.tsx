'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, LucideIcon } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'info';

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  showNotification: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((message: string, type: NotificationType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  }, []);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 min-w-[320px] max-w-md">
        {notifications.map((n) => (
          <Toast key={n.id} notification={n} onClose={() => removeNotification(n.id)} />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

function Toast({ notification, onClose }: { notification: Notification; onClose: () => void }) {
  const icons: Record<NotificationType, LucideIcon> = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
  };

  const Icon = icons[notification.type];

  const colors = {
    success: 'border-green-500/50 bg-green-500/10 text-green-400',
    error: 'border-red-500/50 bg-red-500/10 text-red-400',
    info: 'border-blue-500/50 bg-blue-500/10 text-blue-400',
  };

  return (
    <div className={`p-4 rounded-xl border backdrop-blur-md shadow-2xl flex items-start gap-3 animate-in slide-in-from-right-full duration-300 ${colors[notification.type]}`}>
      <Icon size={20} className="shrink-0 mt-0.5" />
      <p className="text-sm font-medium flex-1">{notification.message}</p>
      <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
        <X size={18} />
      </button>
    </div>
  );
}

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within a NotificationProvider');
  return context;
};
