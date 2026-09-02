import React from 'react';
import {
  Users,
  Clock,
  Calendar,
  CheckSquare,
  FileText,
  BarChart3,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, Badge } from '../ui';

export const OperationsOverviewSection = () => {
  const flowNodes = [
    {
      title: 'People Directory',
      subtitle: 'Employee profiles & teams',
      icon: Users,
    },
    {
      title: 'Attendance',
      subtitle: 'Daily check-in & hours',
      icon: Clock,
    },
    {
      title: 'Leave & Absence',
      subtitle: 'Approvals & balance',
      icon: Calendar,
    },
    {
      title: 'Task Workflows',
      subtitle: 'Duties & deliverables',
      icon: CheckSquare,
    },
    {
      title: 'Docs & Broadcasts',
      subtitle: 'Policies & notices',
      icon: FileText,
    },
    {
      title: 'Reports & Audits',
      subtitle: 'Data & compliance',
      icon: BarChart3,
    },
  ];

  return (
    <section id="operations" className="py-16 md:py-24 bg-secondary/30 border-y border-border scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="primary" size="sm">
            Connected Architecture
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            How WorkNest connects your workplace operations
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Data moves seamlessly between daily attendance, time off, task assignments, and reporting without manual re-entry.
          </p>
        </div>

        {/* Connected Pipeline Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 relative">
          {flowNodes.map((node, index) => {
            const Icon = node.icon;
            return (
              <div key={node.title} className="relative flex flex-col items-center text-center">
                <Card className="w-full h-full p-4 flex flex-col items-center justify-center text-center space-y-2.5 border-border hover:border-teal-500/50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>

                  <h4 className="text-xs sm:text-sm font-semibold text-foreground tracking-tight">
                    {node.title}
                  </h4>

                  <p className="text-[11px] text-muted-foreground leading-tight">
                    {node.subtitle}
                  </p>
                </Card>

                {/* Arrow Connector for Desktop */}
                {index < flowNodes.length - 1 && (
                  <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-muted-foreground/60">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Supporting Architecture Banner */}
        <div className="max-w-3xl mx-auto p-5 rounded-xl border border-border bg-card text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Zero Data Silos</span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            When an employee checks in or takes leave, related project tasks, team availability calendars, and payroll summaries update automatically in real time.
          </p>
        </div>
      </div>
    </section>
  );
};

export default OperationsOverviewSection;
