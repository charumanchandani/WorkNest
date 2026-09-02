import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Clock, Calendar, CheckSquare, Megaphone, FileText } from 'lucide-react';
import { Badge } from '../ui';
import { dashboardMockData } from '../../constants/dashboardData';

export const NotificationPopover = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(dashboardMockData.notifications);
  const popoverRef = useRef(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'leave':
        return <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'announcement':
        return <Megaphone className="w-4 h-4 text-teal-600 dark:text-teal-400" />;
      case 'task':
        return <CheckSquare className="w-4 h-4 text-sky-600 dark:text-sky-400" />;
      default:
        return <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={`Notifications (${unreadCount} unread)`}
        className="relative p-2 rounded-lg border border-border bg-background hover:bg-secondary/70 transition-colors text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-teal-600 text-white text-[10px] font-bold flex items-center justify-center animate-in zoom-in">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popover Card */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Recent Notifications"
          className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-border bg-card text-card-foreground shadow-dialog z-50 p-2 space-y-2 animate-in zoom-in-95 duration-150"
        >
          <div className="p-2 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">Notifications</span>
              {unreadCount > 0 && (
                <Badge variant="primary" size="sm">
                  {unreadCount} new
                </Badge>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="inline-flex items-center gap-1 text-[11px] text-teal-600 dark:text-teal-400 hover:underline font-medium"
              >
                <Check className="w-3 h-3" />
                <span>Mark all as read</span>
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-72 overflow-y-auto space-y-1.5 p-1">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-2.5 rounded-lg border text-xs transition-colors flex items-start gap-2.5 ${
                  n.unread
                    ? 'bg-teal-50/50 dark:bg-teal-950/30 border-teal-200/50 dark:border-teal-800/50'
                    : 'bg-secondary/30 border-transparent text-muted-foreground'
                }`}
              >
                <div className="mt-0.5 shrink-0">{getNotificationIcon(n.type)}</div>
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">{n.title}</span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {n.time}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">{n.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-1.5 text-center text-[10px] text-muted-foreground border-t border-border">
            Full notifications center coming in Phase 11
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPopover;
