import React from 'react';
import {
  Clock,
  Calendar,
  CheckSquare,
  FileText,
  Megaphone,
  UserCheck,
  Building,
  Activity as ActivityIcon,
  RotateCw,
  AlertCircle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Spinner } from '../ui';
import { formatTimeAgo, formatDateTime } from '../../utils/formatters';

const getActivityIcon = (action, entityType) => {
  if (action && action.startsWith('LEAVE')) {
    return <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
  }
  if (action && action.startsWith('TASK')) {
    return <CheckSquare className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />;
  }
  if (action && action.startsWith('DOCUMENT')) {
    return <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
  }
  if (action && action.startsWith('ANNOUNCEMENT')) {
    return <Megaphone className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />;
  }
  if (action && action.startsWith('ATTENDANCE')) {
    return <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />;
  }
  if (action && action.startsWith('EMPLOYEE')) {
    return <UserCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />;
  }
  if (action && action.startsWith('DEPARTMENT')) {
    return <Building className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />;
  }

  switch (entityType) {
    case 'Leave':
      return <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
    case 'Task':
      return <CheckSquare className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />;
    case 'Document':
      return <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
    case 'Announcement':
      return <Megaphone className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />;
    case 'Attendance':
      return <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />;
    default:
      return <ActivityIcon className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />;
  }
};

export const ActivityFeed = ({
  activities = [],
  loading = false,
  error = '',
  onRetry = null,
}) => {
  return (
    <Card className="shadow-subtle border-border h-full flex flex-col">
      <CardHeader className="p-5 pb-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ActivityIcon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <CardTitle className="text-sm font-bold">Recent Operational Activity</CardTitle>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              disabled={loading}
              title="Refresh activity feed"
              aria-label="Refresh activity feed"
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
        <CardDescription className="text-xs">
          Live business operations & audit log
        </CardDescription>
      </CardHeader>

      <CardContent className="p-5 space-y-3.5 flex-1">
        {loading ? (
          <div className="py-10 flex flex-col items-center justify-center text-xs text-muted-foreground gap-2">
            <Spinner size="sm" />
            <span>Loading activity feed...</span>
          </div>
        ) : error ? (
          <div className="py-6 px-3 rounded-lg bg-destructive/10 border border-destructive/20 text-center space-y-2">
            <div className="flex items-center justify-center gap-1 text-xs text-destructive font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{error}</span>
            </div>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-1 text-[11px] text-teal-600 dark:text-teal-400 hover:underline"
              >
                <RotateCw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            )}
          </div>
        ) : activities.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground space-y-1">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center mx-auto text-muted-foreground">
              <ActivityIcon className="w-4 h-4" />
            </div>
            <p className="text-xs font-medium text-foreground">No recent activity</p>
            <p className="text-[11px]">Audit events will show up here in real time.</p>
          </div>
        ) : (
          activities.map((item, index) => {
            const actorName = item.actor?.name || 'System';
            return (
              <div key={item.id || index} className="flex items-start gap-3 text-xs">
                <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center shrink-0 mt-0.5 border border-border/60">
                  {getActivityIcon(item.action, item.entityType)}
                </div>
                <div className="space-y-0.5 min-w-0 flex-1">
                  <p className="text-foreground leading-snug break-words">
                    <span className="font-semibold text-foreground mr-1">{actorName}</span>
                    <span className="text-muted-foreground">
                      {item.description ? item.description.replace(new RegExp(`^${actorName}\\s*`, 'i'), '') : ''}
                    </span>
                  </p>
                  <span
                    className="text-[10px] text-muted-foreground block"
                    title={formatDateTime(item.createdAt || item.timestamp)}
                  >
                    {formatTimeAgo(item.createdAt || item.timestamp)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
