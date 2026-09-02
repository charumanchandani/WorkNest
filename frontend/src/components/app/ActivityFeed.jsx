import React from 'react';
import { Clock, Calendar, Check, FileText, Activity } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui';

export const ActivityFeed = ({ activities = [] }) => {
  const getActivityIcon = (iconName) => {
    switch (iconName) {
      case 'clock':
        return <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />;
      case 'calendar':
        return <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
      case 'check':
        return <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />;
    }
  };

  return (
    <Card className="shadow-subtle border-border h-full flex flex-col">
      <CardHeader className="p-5 pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <CardTitle className="text-sm font-bold">Recent Operational Activity</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Your audit logs & actions
        </CardDescription>
      </CardHeader>

      <CardContent className="p-5 space-y-3.5 flex-1">
        {activities.map((item, index) => (
          <div key={item.id || index} className="flex items-start gap-3 text-xs">
            <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center shrink-0 mt-0.5 border border-border/50">
              {getActivityIcon(item.icon)}
            </div>
            <div className="space-y-0.5 min-w-0 flex-1">
              <span className="font-semibold text-foreground block truncate">
                {item.event}
              </span>
              <span className="text-[11px] text-muted-foreground block">
                {item.timestamp}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
