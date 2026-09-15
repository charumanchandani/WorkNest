import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, CalendarPlus, PlusCircle, FileText } from 'lucide-react';

export const QuickActions = () => {
  const actions = [
    {
      label: 'Log Attendance',
      subtext: 'Check-in / Check-out',
      icon: Clock,
      path: '/app/attendance',
      status: 'Live',
    },
    {
      label: 'Request Leave',
      subtext: 'Time-off application',
      icon: CalendarPlus,
      path: '/app/leave',
      status: 'Live',
    },
    {
      label: 'My Open Tasks',
      subtext: 'Update assigned items',
      icon: PlusCircle,
      path: '/app/tasks',
      status: 'Live',
    },
    {
      label: 'Browse Documents',
      subtext: 'Company vault & policies',
      icon: FileText,
      path: '/app/documents',
      status: 'Live',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Quick Workplace Actions
        </span>
        <span className="text-[11px] text-muted-foreground">
          Modular Shortcuts
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.label}
              to={action.path}
              className="p-3 rounded-xl border border-border bg-card hover:bg-secondary/60 hover:border-teal-500/40 text-left transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] text-teal-700 dark:text-teal-400 font-medium bg-teal-50 dark:bg-teal-950/60 px-1.5 py-0.5 rounded border border-teal-200/50 dark:border-teal-800/50">
                  {action.status}
                </span>
              </div>
              <span className="text-xs font-semibold text-foreground block truncate">
                {action.label}
              </span>
              <span className="text-[11px] text-muted-foreground block truncate">
                {action.subtext}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;

