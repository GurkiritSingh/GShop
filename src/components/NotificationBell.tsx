import { useState } from 'react';
import type { AppNotification } from '../hooks/useNotifications';

interface NotificationBellProps {
  notifications: AppNotification[];
  unreadCount: number;
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onRequestPermission: () => Promise<boolean>;
}

export function NotificationBell({
  notifications, unreadCount, onMarkAllRead, onClearAll, onRequestPermission,
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);

  const toggle = () => {
    setOpen(!open);
    if (!open && unreadCount > 0) onMarkAllRead();
  };

  const timeAgo = (ts: number) => {
    const mins = Math.floor((Date.now() - ts) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const typeIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'success': return '\u2705';
      case 'warning': return '\u26A0\uFE0F';
      default: return '\u2139\uFE0F';
    }
  };

  return (
    <div className="notif-wrapper">
      <button className="notif-bell" onClick={toggle} title="Notifications">
        {'\uD83D\uDD14'}
        {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-dropdown-header">
            <span>Notifications</span>
            <div className="notif-header-actions">
              <button onClick={onRequestPermission} title="Enable browser notifications">
                {'\uD83D\uDD14'} Enable
              </button>
              {notifications.length > 0 && (
                <button onClick={onClearAll}>Clear all</button>
              )}
            </div>
          </div>

          {notifications.length === 0 ? (
            <div className="notif-empty">No notifications yet</div>
          ) : (
            <div className="notif-list">
              {notifications.slice(0, 15).map(n => (
                <div key={n.id} className={`notif-item ${n.read ? '' : 'unread'}`}>
                  <span className="notif-icon">{typeIcon(n.type)}</span>
                  <div className="notif-content">
                    <span className="notif-message">{n.message}</span>
                    <span className="notif-time">{timeAgo(n.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
