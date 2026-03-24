import { useState, useCallback } from 'react';

export interface AppNotification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  timestamp: number;
  read: boolean;
}

const STORAGE_KEY = 'gshop-notifications';

function load(): AppNotification[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function save(notifs: AppNotification[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifs));
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>(load);

  const addNotification = useCallback((message: string, type: AppNotification['type'] = 'info') => {
    setNotifications(prev => {
      const notif: AppNotification = {
        id: `notif-${Date.now()}`,
        message,
        type,
        timestamp: Date.now(),
        read: false,
      };
      const next = [notif, ...prev].slice(0, 30);
      save(next);

      // Browser notification if permitted
      if (Notification.permission === 'granted') {
        new Notification('GShop', { body: message, icon: '/favicon.svg' });
      }

      return next;
    });
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => {
      const next = prev.map(n => ({ ...n, read: true }));
      save(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    save([]);
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    const result = await Notification.requestPermission();
    return result === 'granted';
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    addNotification,
    markAllRead,
    clearAll,
    requestPermission,
  };
}
