import React from 'react';
import { Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from '../ui';

export const AttendanceWidget = ({ weeklyData = [], onDetailsClick }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Present':
        return <Badge variant="success" size="sm" dot>Present</Badge>;
      case 'Late':
        return <Badge variant="warning" size="sm" dot>Late</Badge>;
      case 'Absent':
        return <Badge variant="destructive" size="sm" dot>Absent</Badge>;
      default:
        return <Badge variant="outline" size="sm">Upcoming</Badge>;
    }
  };

  return (
    <Card className="shadow-subtle border-border h-full flex flex-col">
      <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between border-b border-border">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <CardTitle className="text-sm font-bold">This Week&apos;s Attendance</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Daily check-in logs & working hours
          </CardDescription>
        </div>

        <button
          type="button"
          onClick={() => onDetailsClick && onDetailsClick('Attendance History', 'Phase 7')}
          className="text-xs text-teal-600 dark:text-teal-400 font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded px-1"
        >
          View Full Log
        </button>
      </CardHeader>

      <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
        {/* Weekly Log List */}
        <div className="space-y-2">
          {weeklyData.map((item) => (
            <div
              key={item.day}
              className="flex items-center justify-between p-2.5 rounded-lg border border-border/60 bg-secondary/30 text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="font-semibold text-foreground w-8">{item.day}</span>
                <span className="text-[11px] text-muted-foreground w-12">{item.date}</span>
                <div className="hidden sm:flex items-center gap-1.5 text-muted-foreground">
                  <span>{item.checkIn}</span>
                  <span>&rarr;</span>
                  <span>{item.checkOut}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono text-[11px] text-muted-foreground">{item.hours}</span>
                {getStatusBadge(item.status)}
              </div>
            </div>
          ))}
        </div>

        {/* Live today indicator */}
        <div className="p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Today&apos;s session active (In: 09:18 AM)</span>
          </div>
          <span className="font-semibold font-mono">3.5h logged</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceWidget;
