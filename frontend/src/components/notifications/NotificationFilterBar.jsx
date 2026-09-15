import React from 'react';
import { CheckCheck, Filter, RotateCw } from 'lucide-react';
import { Button, Badge } from '../ui';

const NOTIFICATION_TYPE_OPTIONS = [
  { value: '', label: 'All Categories' },
  { value: 'LEAVE_SUBMITTED', label: 'Leave Submitted' },
  { value: 'LEAVE_APPROVED', label: 'Leave Approved' },
  { value: 'LEAVE_REJECTED', label: 'Leave Rejected' },
  { value: 'TASK_ASSIGNED', label: 'Task Assigned' },
  { value: 'TASK_STATUS_CHANGED', label: 'Task Updates' },
  { value: 'TASK_COMPLETED', label: 'Task Completed' },
  { value: 'DOCUMENT_ADDED', label: 'Documents' },
  { value: 'ANNOUNCEMENT_PUBLISHED', label: 'Announcements' },
];

export const NotificationFilterBar = ({
  unreadOnly,
  onToggleUnread,
  selectedType,
  onSelectType,
  onMarkAllRead,
  unreadCount = 0,
  onRefresh,
  loading = false,
  isMarkingAll = false,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border border-border bg-card">
      {/* Left: Tab switchers & Type filter */}
      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
        <div className="inline-flex p-1 rounded-lg bg-secondary/70 border border-border/60">
          <button
            type="button"
            onClick={() => onToggleUnread(false)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              !unreadOnly
                ? 'bg-background text-foreground shadow-subtle'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => onToggleUnread(true)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              unreadOnly
                ? 'bg-background text-foreground shadow-subtle'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <Badge variant="primary" size="sm" className="px-1.5 py-0 text-[10px]">
                {unreadCount}
              </Badge>
            )}
          </button>
        </div>

        {/* Type selector */}
        <div className="relative">
          <select
            value={selectedType}
            onChange={(e) => onSelectType(e.target.value)}
            aria-label="Filter by notification type"
            className="h-8.5 text-xs px-2.5 py-1 rounded-lg border border-border bg-background text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {NOTIFICATION_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onMarkAllRead}
            disabled={isMarkingAll || loading}
            className="text-xs text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800 hover:bg-teal-50 dark:hover:bg-teal-950/50"
          >
            <CheckCheck className="w-3.5 h-3.5 mr-1" />
            <span>{isMarkingAll ? 'Marking...' : 'Mark all as read'}</span>
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          aria-label="Refresh notifications"
          title="Refresh notifications"
          className="h-8.5 w-8.5 p-0"
        >
          <RotateCw className={`w-3.5 h-3.5 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    </div>
  );
};

export default NotificationFilterBar;
