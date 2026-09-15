import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  AlertCircle,
  Inbox,
} from 'lucide-react';
import { Badge, Button, Spinner, Alert } from '../components/ui';
import { NotificationItem, NotificationFilterBar } from '../components/notifications';
import notificationService from '../services/notificationService';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        page,
        limit: 15,
        unreadOnly: unreadOnly ? 'true' : undefined,
        type: selectedType || undefined,
      };

      const res = await notificationService.getNotifications(params);
      if (res?.data) {
        const records = res.data.records || res.data.notifications || res.data.data || [];
        setNotifications(records);
        setTotal(res.data.total || records.length);
        setTotalPages(res.data.totalPages || 1);
        if (res.data.unreadCount !== undefined) {
          setUnreadCount(res.data.unreadCount);
        }
      }
    } catch (err) {
      setError(err.formattedMessage || 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  }, [page, unreadOnly, selectedType]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      if (unreadOnly) {
        // If unreadOnly is active, refresh the current page to update list cleanly
        fetchNotifications();
      }
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setIsMarkingAll(true);
      await notificationService.markAllNotificationsRead();
      setSuccessMessage('All notifications marked as read.');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      if (unreadOnly) {
        setNotifications([]);
      }
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err.formattedMessage || 'Failed to mark all as read.');
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleToggleUnread = (val) => {
    setUnreadOnly(val);
    setPage(1);
  };

  const handleSelectType = (type) => {
    setSelectedType(type);
    setPage(1);
  };

  const handleNavigate = (route) => {
    if (route) {
      navigate(route);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <Bell className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Notification Center
            </h1>
            {unreadCount > 0 ? (
              <Badge variant="primary" size="md">
                {unreadCount} unread
              </Badge>
            ) : (
              <Badge variant="secondary" size="md">
                All caught up
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage your workspace notices, task assignments, leave reviews, and announcements.
          </p>
        </div>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <Alert variant="success" className="animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMessage}</span>
        </Alert>
      )}

      {/* Error Banner */}
      {error && (
        <Alert variant="destructive" className="animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchNotifications}
            className="ml-auto text-xs"
          >
            <RotateCw className="w-3 h-3 mr-1" />
            Retry
          </Button>
        </Alert>
      )}

      {/* 2. Filter & Action Toolbar */}
      <NotificationFilterBar
        unreadOnly={unreadOnly}
        onToggleUnread={handleToggleUnread}
        selectedType={selectedType}
        onSelectType={handleSelectType}
        onMarkAllRead={handleMarkAllRead}
        unreadCount={unreadCount}
        onRefresh={fetchNotifications}
        loading={loading}
        isMarkingAll={isMarkingAll}
      />

      {/* 3. Notifications List Content */}
      <div className="space-y-3">
        {loading && notifications.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center rounded-xl border border-border bg-card text-muted-foreground text-sm gap-3">
            <Spinner size="md" />
            <span>Loading notifications...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center rounded-xl border border-border bg-card text-center p-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
              <Inbox className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="text-sm font-semibold text-foreground">
                {unreadOnly ? 'No unread notifications' : 'No notifications found'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {unreadOnly
                  ? "You're all caught up! There are no unread notifications for you right now."
                  : selectedType
                  ? 'No notifications match the selected category filter.'
                  : "You don't have any notifications logged in your account yet."}
              </p>
            </div>
            {unreadOnly && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUnreadOnly(false)}
                className="text-xs mt-2"
              >
                View all notifications
              </Button>
            )}
          </div>
        ) : (
          notifications.map((item) => (
            <NotificationItem
              key={item.id}
              notification={item}
              onMarkRead={handleMarkRead}
              onNavigate={handleNavigate}
            />
          ))
        )}
      </div>

      {/* 4. Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground">
            Showing Page <span className="font-semibold text-foreground">{page}</span> of{' '}
            <span className="font-semibold text-foreground">{totalPages}</span> ({total} total)
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="text-xs"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" />
              Previous
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="text-xs"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
