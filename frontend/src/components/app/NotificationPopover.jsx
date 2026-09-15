import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck, ExternalLink, RotateCw, AlertCircle } from 'lucide-react';
import { Badge, Spinner } from '../ui';
import notificationService from '../../services/notificationService';
import { NotificationItem } from '../notifications/NotificationItem';

export const NotificationPopover = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const popoverRef = useRef(null);
  const navigate = useNavigate();

  // Fetch unread count for badge
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await notificationService.getUnreadCount();
      if (res?.data?.unreadCount !== undefined) {
        setUnreadCount(res.data.unreadCount);
      }
    } catch {
      // Background poll fail should silently ignore
    }
  }, []);

  // Fetch recent notifications when popover is opened
  const fetchRecentNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await notificationService.getNotifications({ limit: 5 });
      if (res?.data) {
        const records = res.data.records || res.data.notifications || res.data.data || [];
        setNotifications(records);
        if (res.data.unreadCount !== undefined) {
          setUnreadCount(res.data.unreadCount);
        }
      }
    } catch (err) {
      setError(err.formattedMessage || 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch and 45s periodic background polling for unread badge
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 45000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Fetch full list when opening popover
  useEffect(() => {
    if (isOpen) {
      fetchRecentNotifications();
    }
  }, [isOpen, fetchRecentNotifications]);

  // Handle outside clicks and ESC key
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

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // silently handle or retry
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // handle error
    }
  };

  const handleNavigate = (route) => {
    setIsOpen(false);
    if (route) {
      navigate(route);
    }
  };

  const handleViewAll = () => {
    setIsOpen(false);
    navigate('/app/notifications');
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
          <span className="absolute -top-1 -right-1 w-4.5 h-4.5 px-1 rounded-full bg-teal-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-background animate-in zoom-in">
            {unreadCount > 99 ? '99+' : unreadCount}
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
          {/* Header */}
          <div className="p-2 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">Notifications</span>
              {unreadCount > 0 ? (
                <Badge variant="primary" size="sm">
                  {unreadCount} unread
                </Badge>
              ) : (
                <span className="text-[11px] text-muted-foreground">All caught up</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="inline-flex items-center gap-1 text-[11px] text-teal-600 dark:text-teal-400 hover:underline font-medium"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto space-y-2 p-1">
            {loading ? (
              <div className="py-8 flex flex-col items-center justify-center text-muted-foreground text-xs gap-2">
                <Spinner size="sm" />
                <span>Loading notifications...</span>
              </div>
            ) : error ? (
              <div className="py-6 px-3 rounded-lg bg-destructive/10 border border-destructive/20 text-center space-y-2">
                <div className="flex items-center justify-center gap-1 text-xs text-destructive font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{error}</span>
                </div>
                <button
                  type="button"
                  onClick={fetchRecentNotifications}
                  className="inline-flex items-center gap-1 text-[11px] text-teal-600 dark:text-teal-400 hover:underline"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>Try again</span>
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center space-y-1">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center mx-auto text-muted-foreground">
                  <Check className="w-4 h-4" />
                </div>
                <p className="text-xs font-medium text-foreground">No notifications</p>
                <p className="text-[11px] text-muted-foreground">
                  You have no pending notifications right now.
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onMarkRead={handleMarkRead}
                  onNavigate={handleNavigate}
                  compact
                />
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-1.5 border-t border-border">
            <button
              type="button"
              onClick={handleViewAll}
              className="w-full py-1.5 px-2 rounded-lg text-xs font-semibold text-teal-600 dark:text-teal-400 hover:bg-secondary/60 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Notification Center</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPopover;
