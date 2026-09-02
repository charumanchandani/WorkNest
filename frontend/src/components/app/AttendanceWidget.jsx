import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Calendar, CheckCircle2, AlertCircle, LogIn, LogOut, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button } from '../ui';

export const AttendanceWidget = ({
  todayAttendance = null,
  error = '',
}) => {
  const formatTime = (isoString) => {
    if (!isoString) return '—';
    try {
      return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(new Date(isoString));
    } catch {
      return '—';
    }
  };

  const formatHours = (minutes) => {
    if (!minutes || minutes <= 0) return '0h 0m';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  const isCheckedIn = Boolean(todayAttendance?.checkIn);
  const isCheckedOut = Boolean(todayAttendance?.checkOut);

  return (
    <Card className="shadow-subtle border-border h-full flex flex-col">
      <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between border-b border-border">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <CardTitle className="text-sm font-bold">Today&apos;s Workday Attendance</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Live shift tracking & working hours
          </CardDescription>
        </div>

        <Link
          to="/app/attendance"
          className="text-xs text-teal-600 dark:text-teal-400 font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded px-1 inline-flex items-center gap-1"
        >
          <span>Attendance Page</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </CardHeader>

      <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
        {error ? (
          <div className="p-3 rounded-lg bg-secondary/40 border border-border text-xs text-muted-foreground">
            Unable to fetch real-time attendance. Check the attendance page for full records.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 text-center">
            {/* Check-In */}
            <div className="p-3 rounded-xl bg-secondary/30 border border-border/60 space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                Check-In
              </span>
              <span className="font-mono font-bold text-foreground text-xs sm:text-sm block truncate">
                {isCheckedIn ? formatTime(todayAttendance.checkIn) : '—'}
              </span>
              <span className="text-[9px] text-muted-foreground block">
                {isCheckedIn ? (todayAttendance.status === 'LATE' ? 'Late arrival' : 'On-time') : 'Pending'}
              </span>
            </div>

            {/* Check-Out */}
            <div className="p-3 rounded-xl bg-secondary/30 border border-border/60 space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                Check-Out
              </span>
              <span className="font-mono font-bold text-foreground text-xs sm:text-sm block truncate">
                {isCheckedOut ? formatTime(todayAttendance.checkOut) : '—'}
              </span>
              <span className="text-[9px] text-muted-foreground block">
                {isCheckedOut ? 'Completed' : isCheckedIn ? 'In progress' : 'Not started'}
              </span>
            </div>

            {/* Total Duration */}
            <div className="p-3 rounded-xl bg-secondary/30 border border-border/60 space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                Shift Hours
              </span>
              <span className="font-mono font-bold text-foreground text-xs sm:text-sm block truncate">
                {isCheckedOut
                  ? formatHours(todayAttendance.totalMinutes)
                  : isCheckedIn
                  ? 'Active'
                  : '0h 0m'}
              </span>
              <span className="text-[9px] text-muted-foreground block">
                {isCheckedOut ? 'Logged' : isCheckedIn ? 'Running' : '8h target'}
              </span>
            </div>
          </div>
        )}

        {/* Live Today Banner & CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border/60">
          <div className="flex items-center gap-2 text-xs">
            {isCheckedOut ? (
              <span className="text-muted-foreground flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                Shift completed for today ({formatHours(todayAttendance?.totalMinutes)} logged).
              </span>
            ) : isCheckedIn ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                Live workday session active since {formatTime(todayAttendance?.checkIn)}.
              </span>
            ) : (
              <span className="text-muted-foreground">
                You have not checked in for today yet.
              </span>
            )}
          </div>

          <Link to="/app/attendance">
            <Button
              variant={!isCheckedIn ? 'primary' : !isCheckedOut ? 'destructive' : 'outline'}
              size="sm"
              className="text-xs shrink-0 w-full sm:w-auto"
            >
              {!isCheckedIn ? 'Check In' : !isCheckedOut ? 'Check Out' : 'View Attendance'}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceWidget;
