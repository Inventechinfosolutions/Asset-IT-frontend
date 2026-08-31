import { Bell, CheckCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { useMarkAllNotificationsRead } from '../hooks/use-notification-mutations';
import { useNotifications } from '../hooks/use-notifications';
import { formatNotificationDate } from '../utils/format-notification-date';

type NotificationBellProps = {
  receiverId: string;
};

export function NotificationBell({ receiverId }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { data, isError } = useNotifications(receiverId);
  const markAllRead = useMarkAllNotificationsRead(receiverId);
  const unreadCount = data?.unreadCount ?? 0;

  useEffect(() => {
    if (!isOpen) return;

    function closeOnOutsideClick(event: MouseEvent) {
      const target = event.target;
      if (
        containerRef.current &&
        target instanceof Node &&
        !containerRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, [isOpen]);

  return (
    <div className="notification-center" ref={containerRef}>
      <button
        type="button"
        className={`header-notif-btn${unreadCount > 0 ? ' has-unread' : ''}`}
        aria-label={
          unreadCount > 0
            ? `${unreadCount} unread notifications`
            : 'Notifications'
        }
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        onClick={() => setIsOpen((open) => !open)}
      >
        <Bell size={18} aria-hidden="true" />
        {unreadCount > 0 ? (
          <span className="header-notif-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <section
          className="notification-panel"
          role="dialog"
          aria-label="Notifications"
        >
          <div className="notification-panel-header">
            <h2>Notifications</h2>
            <button
              type="button"
              className="notification-mark-all"
              disabled={!data?.data.length || markAllRead.isPending}
              onClick={() => markAllRead.mutate()}
            >
              <CheckCheck size={15} aria-hidden="true" />
              Mark all read
            </button>
          </div>

          {isError ? (
            <p className="notification-empty">
              Notifications are temporarily unavailable.
            </p>
          ) : data?.data.length ? (
            <ul className="notification-list">
              {data.data.map((notification) => (
                <li
                  className={`notification-item${
                    notification.isRead ? '' : ' unread'
                  }`}
                  key={notification.id}
                >
                  <div className="notification-item-content">
                    <span
                      className="notification-item-dot"
                      aria-hidden="true"
                    />
                    <span className="notification-item-copy">
                      <strong>{notification.title}</strong>
                      <span>{notification.message}</span>
                      <time dateTime={notification.createdAt}>
                        {formatNotificationDate(notification.createdAt)}
                      </time>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="notification-empty">You’re all caught up.</p>
          )}
        </section>
      ) : null}
    </div>
  );
}
