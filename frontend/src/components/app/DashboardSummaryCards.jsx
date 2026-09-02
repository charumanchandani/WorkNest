import React from 'react';
import { Clock, Calendar, CheckSquare, Bell, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, Badge } from '../ui';

export const DashboardSummaryCards = ({ metrics, onQuickAction }) => {
  const cards = [
    {
      title: "Today's Attendance",
      value: metrics?.todayAttendance?.status || 'Present',
      subtext: `Checked in at ${metrics?.todayAttendance?.checkInTime || '09:18 AM'}`,
      badgeText: metrics?.todayAttendance?.onTime ? 'On Time' : 'Standard',
      badgeVariant: 'success',
      icon: Clock,
      color: 'teal',
      actionName: 'My Attendance',
      phase: 'Phase 7',
    },
    {
      title: 'Leave Balance',
      value: `${metrics?.leaveBalance?.availableDays || 12} Days`,
      subtext: `${metrics?.leaveBalance?.pendingRequests || 1} pending approval request`,
      badgeText: 'Available',
      badgeVariant: 'primary',
      icon: Calendar,
      color: 'sky',
      actionName: 'My Leave',
      phase: 'Phase 8',
    },
    {
      title: 'Open Tasks',
      value: `${metrics?.tasks?.totalOpen || 5} Assigned`,
      subtext: `${metrics?.tasks?.dueThisWeek || 2} due this week`,
      badgeText: 'Priority',
      badgeVariant: 'warning',
      icon: CheckSquare,
      color: 'amber',
      actionName: 'My Tasks',
      phase: 'Phase 9',
    },
    {
      title: 'Unread Updates',
      value: `${metrics?.notifications?.unreadCount || 3} New`,
      subtext: 'Announcements & activity',
      badgeText: 'Updates',
      badgeVariant: 'info',
      icon: Bell,
      color: 'emerald',
      actionName: 'Notifications',
      phase: 'Phase 11',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card
            key={card.title}
            className="hover:border-teal-500/40 transition-all duration-200 shadow-subtle group cursor-pointer"
            onClick={() => onQuickAction && onQuickAction(card.actionName, card.phase)}
          >
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-secondary/80 flex items-center justify-center text-foreground group-hover:scale-105 transition-transform">
                  <Icon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
                <Badge variant={card.badgeVariant} size="sm">
                  {card.badgeText}
                </Badge>
              </div>

              <div>
                <span className="text-xs font-medium text-muted-foreground block">
                  {card.title}
                </span>
                <span className="text-2xl font-bold tracking-tight text-foreground block mt-0.5">
                  {card.value}
                </span>
              </div>

              <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                <span className="truncate">{card.subtext}</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-teal-600 dark:text-teal-400 shrink-0" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DashboardSummaryCards;
