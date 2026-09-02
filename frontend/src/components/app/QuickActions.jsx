import React from 'react';
import { Clock, CalendarPlus, PlusCircle, FileText } from 'lucide-react';
import { Button } from '../ui';

export const QuickActions = ({ onActionClick }) => {
  const actions = [
    {
      label: 'Log Attendance',
      subtext: 'Check-in / Check-out',
      icon: Clock,
      phase: 'Phase 7',
      name: 'Attendance Tracking',
    },
    {
      label: 'Request Leave',
      subtext: 'Time-off application',
      icon: CalendarPlus,
      phase: 'Phase 8',
      name: 'Leave Management',
    },
    {
      label: 'My Open Tasks',
      subtext: 'Update assigned items',
      icon: PlusCircle,
      phase: 'Phase 9',
      name: 'Task Delegation',
    },
    {
      label: 'Browse Documents',
      subtext: 'Company vault & policies',
      icon: FileText,
      phase: 'Phase 10',
      name: 'Document Management',
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
            <button
              key={action.label}
              type="button"
              onClick={() => onActionClick && onActionClick(action.name, action.phase)}
              className="p-3 rounded-xl border border-border bg-card hover:bg-secondary/60 hover:border-teal-500/40 text-left transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] text-muted-foreground/80 font-mono bg-secondary px-1.5 py-0.5 rounded">
                  {action.phase}
                </span>
              </div>
              <span className="text-xs font-semibold text-foreground block truncate">
                {action.label}
              </span>
              <span className="text-[11px] text-muted-foreground block truncate">
                {action.subtext}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
