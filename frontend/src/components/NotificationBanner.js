'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Bell, X } from 'lucide-react';

export default function NotificationBanner({ userRole = null, userId = null }) {
  const [notifications, setNotifications] = useState([]);
  const [dismissed, setDismissed] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        let response;
        if (userId) {
          // Get user-specific + role-based notifications
          response = await api.get('/admin/notifications/user');
        } else {
          // Get public notifications (no auth required)
          response = await api.get('/admin/notifications/public');
        }
        setNotifications(response.data || []);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    };

    fetchNotifications();
  }, [userId, userRole]);

  const handleDismiss = (id) => {
    setDismissed([...dismissed, id]);
    // Store in localStorage to persist dismissal
    const stored = JSON.parse(localStorage.getItem('dismissedNotifications') || '[]');
    localStorage.setItem('dismissedNotifications', JSON.stringify([...stored, id]));
  };

  // Filter out dismissed notifications
  const visibleNotifications = notifications.filter(n => {
    if (dismissed.includes(n.id)) return false;
    const stored = JSON.parse(localStorage.getItem('dismissedNotifications') || '[]');
    return !stored.includes(n.id);
  });

  if (visibleNotifications.length === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 space-y-1">
      {visibleNotifications.map((notification) => (
        <div
          key={notification.id}
          style={{
            backgroundColor: notification.bg_color || '#3b82f6',
            color: notification.text_color || '#ffffff'
          }}
          className="px-4 py-3 shadow-md"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              {notification.show_icon && (
                <Bell className="h-5 w-5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className="font-semibold">{notification.title}</p>
                <p className="text-sm opacity-90">{notification.message}</p>
              </div>
            </div>
            <button
              onClick={() => handleDismiss(notification.id)}
              className="p-1 hover:bg-black hover:bg-opacity-10 rounded transition-colors flex-shrink-0"
              aria-label="Dismiss notification"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
