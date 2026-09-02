import React from 'react';
import { Users, Clock, Calendar, CheckSquare, BarChart3 } from 'lucide-react';

export const TrustStrip = () => {
  const pillars = [
    { icon: Users, label: 'People Operations' },
    { icon: Clock, label: 'Real-Time Attendance' },
    { icon: Calendar, label: 'Leave Approvals' },
    { icon: CheckSquare, label: 'Task Workflows' },
    { icon: BarChart3, label: 'Workplace Insights' },
  ];

  return (
    <section className="border-y border-border bg-secondary/30 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6">
          Built for modern workplace operations
        </p>

        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 md:gap-14">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.label}
                className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              >
                <div className="w-7 h-7 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span>{pillar.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustStrip;
