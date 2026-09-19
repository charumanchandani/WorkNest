import React from 'react';
import {
  Clock,
  Calendar,
  CheckSquare,
  Users,
  Activity,
  ArrowUpRight,
} from 'lucide-react';
import { Card, CardContent, Badge } from '../ui';
import { useAuth } from '../../hooks';

export const DashboardSummaryCards = ({
  overview,
  onQuickAction,
}) => {
  const { user } = useAuth();
  const role = user?.role || 'EMPLOYEE';

  let cards = [];

  if (role === 'ADMIN') {
    cards = [
      {
        title: 'Total Workforce',
        value: `${overview?.employees?.total ?? 0} Staff`,
        subtext: `${overview?.employees?.active ?? 0} active across ${overview?.departments?.total ?? 0} depts`,
        badgeText: 'Organization',
        badgeVariant: 'secondary',
        icon: Users,
        actionName: 'Employees',
        phase: null,
      },
      {
        title: "Today's Attendance",
        value: `${overview?.attendance?.attendanceRate ?? 0}% Rate`,
        subtext: `${overview?.attendance?.todayPresent ?? 0} employees checked in today`,
        badgeText: 'Live',
        badgeVariant: 'success',
        icon: Clock,
        actionName: 'Attendance Logs',
        phase: null,
      },
      {
        title: 'Pending Leaves',
        value: `${overview?.leaves?.pending ?? 0} Requests`,
        subtext: 'Awaiting management review',
        badgeText: overview?.leaves?.pending > 0 ? 'Pending' : 'Cleared',
        badgeVariant: overview?.leaves?.pending > 0 ? 'warning' : 'secondary',
        icon: Calendar,
        actionName: 'Leave Approvals',
        phase: null,
      },
      {
        title: 'Open Tasks',
        value: `${overview?.tasks?.open ?? 0} Tasks`,
        subtext: `${overview?.tasks?.overdue ?? 0} overdue assignments`,
        badgeText: overview?.tasks?.overdue > 0 ? 'Action Needed' : 'Normal',
        badgeVariant: overview?.tasks?.overdue > 0 ? 'destructive' : 'primary',
        icon: CheckSquare,
        actionName: 'Task Workload',
        phase: null,
      },
    ];
  } else if (role === 'MANAGER') {
    cards = [
      {
        title: 'Team Members',
        value: `${overview?.employees?.total ?? 0} Staff`,
        subtext: `${overview?.employees?.active ?? 0} active in your team`,
        badgeText: 'Team',
        badgeVariant: 'secondary',
        icon: Users,
        actionName: 'Employees',
        phase: null,
      },
      {
        title: 'Team Attendance',
        value: `${overview?.attendance?.attendanceRate ?? 0}% Rate`,
        subtext: `${overview?.attendance?.todayPresent ?? 0} checked in today`,
        badgeText: 'Live',
        badgeVariant: 'success',
        icon: Clock,
        actionName: 'Attendance Logs',
        phase: null,
      },
      {
        title: 'Leave Approvals',
        value: `${overview?.leaves?.pending ?? 0} Pending`,
        subtext: 'Awaiting your sign-off',
        badgeText: overview?.leaves?.pending > 0 ? 'Review Needed' : 'Cleared',
        badgeVariant: overview?.leaves?.pending > 0 ? 'warning' : 'secondary',
        icon: Calendar,
        actionName: 'Leave Approvals',
        phase: null,
      },
      {
        title: 'Team Tasks',
        value: `${overview?.tasks?.open ?? 0} Active`,
        subtext: `${overview?.tasks?.overdue ?? 0} overdue deliverables`,
        badgeText: overview?.tasks?.overdue > 0 ? 'Overdue' : 'On Track',
        badgeVariant: overview?.tasks?.overdue > 0 ? 'destructive' : 'primary',
        icon: CheckSquare,
        actionName: 'Task Workload',
        phase: null,
      },
    ];
  } else {
    // EMPLOYEE Personal Metrics
    const todayStatus = overview?.attendance?.todayRecord?.status;
    const checkInTime = overview?.attendance?.todayRecord?.checkIn
      ? new Date(overview.attendance.todayRecord.checkIn).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      : null;

    cards = [
      {
        title: "Today's Attendance",
        value: todayStatus || 'Not Checked In',
        subtext: checkInTime
          ? `Checked in at ${checkInTime}`
          : `${overview?.attendance?.periodPresentDays ?? 0} days present this period`,
        badgeText: todayStatus ? 'Logged' : 'Pending',
        badgeVariant: todayStatus ? 'success' : 'secondary',
        icon: Clock,
        actionName: 'My Attendance',
        phase: null,
      },
      {
        title: 'Leave Requests',
        value: `${overview?.leaves?.pending ?? 0} Pending`,
        subtext: `${overview?.leaves?.approvedDaysInPeriod ?? 0} approved days in period`,
        badgeText: 'Status',
        badgeVariant: overview?.leaves?.pending > 0 ? 'warning' : 'primary',
        icon: Calendar,
        actionName: 'My Leave',
        phase: null,
      },
      {
        title: 'Assigned Tasks',
        value: `${overview?.tasks?.open ?? 0} Open`,
        subtext: `${overview?.tasks?.overdue ?? 0} overdue items`,
        badgeText: overview?.tasks?.overdue > 0 ? 'Urgent' : 'Priority',
        badgeVariant: overview?.tasks?.overdue > 0 ? 'destructive' : 'primary',
        icon: CheckSquare,
        actionName: 'My Tasks',
        phase: null,
      },
      {
        title: 'Recent Activity',
        value: `${overview?.activities?.recentCount ?? 0} Events`,
        subtext: 'Operational notices & updates',
        badgeText: 'Activity',
        badgeVariant: 'secondary',
        icon: Activity,
        actionName: 'Notifications',
        phase: null,
      },
    ];
  }

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
