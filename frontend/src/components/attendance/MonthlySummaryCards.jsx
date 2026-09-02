import React from 'react';
import {
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
  Clock3,
  XCircle,
  Briefcase,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, Badge } from '../ui';

export const MonthlySummaryCards = ({
  summary = null,
  selectedMonth = '',
  onMonthChange,
}) => {
  const currentMonthValue = selectedMonth || new Date().toISOString().slice(0, 7);

  const metrics = [
    {
      title: 'Present Days',
      value: summary ? `${summary.presentDays || 0}` : '—',
      subtext: `Target: ${summary?.workingDays || 0} business days`,
      icon: CheckCircle2,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
      borderColor: 'border-emerald-200/60 dark:border-emerald-800/60',
    },
    {
      title: 'Late Check-Ins',
      value: summary ? `${summary.lateDays || 0}` : '—',
      subtext: 'Past 09:30 AM threshold',
      icon: AlertTriangle,
      iconColor: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40',
      borderColor: 'border-amber-200/60 dark:border-amber-800/60',
    },
    {
      title: 'Absences',
      value: summary ? `${summary.absentDays || 0}` : '—',
      subtext: 'Unlogged past weekdays',
      icon: XCircle,
      iconColor: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-50 dark:bg-rose-950/40',
      borderColor: 'border-rose-200/60 dark:border-rose-800/60',
    },
    {
      title: 'Total Hours Worked',
      value: summary ? `${summary.totalWorkedHours || 0}h` : '—',
      subtext: `Avg: ${summary?.averageWorkedHours || 0}h / workday`,
      icon: Clock3,
      iconColor: 'text-teal-600 dark:text-teal-400',
      bgColor: 'bg-teal-50 dark:bg-teal-950/40',
      borderColor: 'border-teal-200/60 dark:border-teal-800/60',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Month Picker Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-foreground">Monthly Summary & Trends</h2>
          <p className="text-xs text-muted-foreground">
            Aggregated attendance performance and working hours
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="summary-month-picker" className="text-xs text-muted-foreground font-medium">
            Period:
          </label>
          <input
            id="summary-month-picker"
            type="month"
            value={currentMonthValue}
            onChange={(e) => onMonthChange(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-border bg-card text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Select month for attendance summary"
          />
        </div>
      </div>

      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <Card
              key={m.title}
              className={`border ${m.borderColor} shadow-subtle transition-all`}
            >
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    {m.title}
                  </span>
                  <div className={`p-1.5 rounded-lg ${m.bgColor}`}>
                    <Icon className={`w-3.5 h-3.5 ${m.iconColor}`} />
                  </div>
                </div>

                <div>
                  <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground block">
                    {m.value}
                  </span>
                  <span className="text-[10px] text-muted-foreground block truncate">
                    {m.subtext}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default MonthlySummaryCards;
