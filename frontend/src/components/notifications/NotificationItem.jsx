import React from 'react';
import {
  Calendar,
  CheckSquare,
  FileText,
  Megaphone,
  Clock,
  Bell,
  Check,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '../ui';
import { formatTimeAgo, formatDateTime } from '../../utils/formatters';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'LEAVE_SUBMITTED':
    case 'LEAVE_APPROVED':
    case 'LEAVE_REJECTED':
    case 'LEAVE_CANCELLED':
      return <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    case 'TASK_ASSIGNED':
    case 'TASK_STATUS_CHANGED':
    case 'TASK_COMPLETED':
      return <CheckSquare className="w-4 h-4 text-sky-600 dark:text-sky-400" />;
    case 'DOCUMENT_ADDED':
      return <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    case 'ANNOUNCEMENT_PUBLISHED':
      return <Megaphone className="w-4 h-4 text-teal-600 dark:text-teal-400" />;
    case 'ATTENDANCE_REMINDER':
      return <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
    default:
      return <Bell className="w-4 h-4 text-teal-600 dark:text-teal-400" />;
  }
};

const getEntityRoute = (entityType) => {
  switch (entityType) {
    case 'Leave':
      return '/app/leaves';
    case 'Task':
      return '/app/tasks';
    case 'Document':
      return '/app/documents';
    case 'Announcement':
      return '/app/announcements';
    case 'Attendance':
      return '/app/attendance';
    default:
      return null;
  }
};

export const NotificationItem = ({
  notification,
  onMarkRead,
  onNavigate,
  compact = false,
}) => {
  const { id, type, title, message, isRead, createdAt, entityType } = notification;

  const targetRoute = getEntityRoute(entityType);

  const handleItemClick = (e) => {
    // If click was on a button, don't trigger parent navigate
    if (e.target.closest('button')) return;

    if (!isRead && onMarkRead) {
      onMarkRead(id);
    }
    if (targetRoute && onNavigate) {
      onNavigate(targetRoute);
    }
  };

  const handleMarkReadBtn = (e) => {
    e.stopPropagation();
    if (onMarkRead) {
      onMarkRead(id);
    }
  };

  return (
    <div
      onClick={handleItemClick}
      className={`group relative rounded-xl border transition-all duration-150 ${
        compact ? 'p-3 text-xs' : 'p-4 text-sm'
      } ${
        !isRead
          ? 'bg-teal-50/40 dark:bg-teal-950/20 border-teal-200/80 dark:border-teal-800/80 shadow-sm'
          : 'bg-card border-border hover:bg-secondary/40'
      } ${targetRoute ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start gap-3">
        {/* Type Icon Container with unread dot indicator */}
        <div className="relative shrink-0 mt-0.5">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
              !isRead
                ? 'bg-background border-teal-300 dark:border-teal-700 shadow-subtle'
                : 'bg-secondary/70 border-border/70'
            }`}
          >
            {getNotificationIcon(type)}
          </div>
          {!isRead && (
            <span
              className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-teal-600 ring-2 ring-background animate-pulse"
              title="Unread notification"
              aria-label="Unread"
            />
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h4
                className={`text-foreground font-semibold leading-snug break-words ${
                  compact ? 'text-xs' : 'text-sm'
                }`}
              >
                {title}
              </h4>
              {!isRead && (
                <Badge variant="primary" size="sm" className="text-[10px] px-1.5 py-0">
                  New
                </Badge>
              )}
            </div>

            <span
              className="text-[11px] text-muted-foreground shrink-0 whitespace-nowrap"
              title={formatDateTime(createdAt)}
            >
              {formatTimeAgo(createdAt)}
            </span>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed break-words">
            {message}
          </p>

          {/* Footer Metadata & Actions */}
          <div className="flex items-center justify-between pt-1 gap-2">
            {targetRoute ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-teal-600 dark:text-teal-400 group-hover:underline">
                <span>View {entityType || 'Item'}</span>
                <ExternalLink className="w-3 h-3" />
              </span>
            ) : (
              <span />
            )}

            {!isRead && (
              <button
                type="button"
                onClick={handleMarkReadBtn}
                title="Mark as read"
                aria-label="Mark notification as read"
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent hover:border-border transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Mark read</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
