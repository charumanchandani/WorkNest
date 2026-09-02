import React, { useState, useEffect } from 'react';
import {
  Clock,
  LogIn,
  LogOut,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Timer,
  Check,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge, Alert } from '../ui';

export const TodayAttendanceCard = ({
  attendance = null,
  onCheckIn,
  onCheckOut,
  isMutating = false,
  error = '',
  onClearError,
}) => {
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  const isCheckedIn = Boolean(attendance?.checkIn);
  const isCheckedOut = Boolean(attendance?.checkOut);

  // Live elapsed timer calculation while checked in
  useEffect(() => {
    if (isCheckedIn && !isCheckedOut && attendance?.checkIn) {
      const calculateElapsed = () => {
        const checkInTime = new Date(attendance.checkIn).getTime();
        const nowTime = new Date().getTime();
        const diff = Math.max(0, Math.round((nowTime - checkInTime) / (1000 * 60)));
        setElapsedMinutes(diff);
      };

      calculateElapsed();
      const interval = setInterval(calculateElapsed, 30000); // update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isCheckedIn, isCheckedOut, attendance?.checkIn]);

  // Formatter helpers
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

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  const getStatusBadge = () => {
    if (!isCheckedIn) {
      return (
        <Badge variant="outline" size="sm">
          Not Checked In
        </Badge>
      );
    }
    if (attendance?.status === 'LATE') {
      return (
        <Badge variant="warning" size="sm" dot>
          Late Check-In
        </Badge>
      );
    }
    return (
      <Badge variant="success" size="sm" dot>
        Present On-Time
      </Badge>
    );
  };

  return (
    <Card className="shadow-subtle border-border bg-gradient-to-br from-card to-card/90">
      <CardHeader className="p-6 pb-4 border-b border-border/80 flex flex-row items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <CardTitle className="text-sm font-bold">Today's Attendance</CardTitle>
          </div>
          <CardDescription className="text-xs flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            <span>{todayFormatted}</span>
          </CardDescription>
        </div>

        <div>{getStatusBadge()}</div>
      </CardHeader>

      <CardContent className="p-6 space-y-5">
        {error && (
          <Alert
            variant="destructive"
            title="Attendance Action Error"
            onDismiss={onClearError}
          >
            {error}
          </Alert>
        )}

        {/* 3 Metric Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* 1. Check-In */}
          <div className="p-3.5 rounded-xl border border-border/70 bg-secondary/20 space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">
              <LogIn className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Check-In</span>
            </div>
            <div className="text-base font-bold text-foreground font-mono">
              {formatTime(attendance?.checkIn)}
            </div>
            <span className="text-[10px] text-muted-foreground block">
              {isCheckedIn ? 'Recorded by server' : 'Awaiting check-in'}
            </span>
          </div>

          {/* 2. Check-Out */}
          <div className="p-3.5 rounded-xl border border-border/70 bg-secondary/20 space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">
              <LogOut className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>Check-Out</span>
            </div>
            <div className="text-base font-bold text-foreground font-mono">
              {formatTime(attendance?.checkOut)}
            </div>
            <span className="text-[10px] text-muted-foreground block">
              {isCheckedOut ? 'Shift completed' : isCheckedIn ? 'Shift in progress' : 'Not started'}
            </span>
          </div>

          {/* 3. Worked Time */}
          <div className="p-3.5 rounded-xl border border-border/70 bg-secondary/20 space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">
              <Timer className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Worked Hours</span>
            </div>
            <div className="text-base font-bold text-foreground font-mono">
              {isCheckedOut
                ? formatHours(attendance?.totalMinutes)
                : isCheckedIn
                ? formatHours(elapsedMinutes)
                : '0h 0m'}
            </div>
            <span className="text-[10px] text-muted-foreground block">
              {isCheckedOut
                ? 'Total logged duration'
                : isCheckedIn
                ? 'Active elapsed timer'
                : 'Target: 8h shift'}
            </span>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            {!isCheckedIn ? (
              <span>Start your workday by logging check-in time (threshold 09:30 AM).</span>
            ) : !isCheckedOut ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Active workday in progress. Check out at the end of your shift.
              </span>
            ) : (
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-500" />
                Your daily attendance record for today is complete and finalized.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
            {!isCheckedIn && (
              <Button
                variant="primary"
                size="md"
                leftIcon={LogIn}
                onClick={onCheckIn}
                isLoading={isMutating}
                className="w-full sm:w-auto"
              >
                Check In Now
              </Button>
            )}

            {isCheckedIn && !isCheckedOut && (
              <Button
                variant="destructive"
                size="md"
                leftIcon={LogOut}
                onClick={onCheckOut}
                isLoading={isMutating}
                className="w-full sm:w-auto"
              >
                Check Out Shift
              </Button>
            )}

            {isCheckedOut && (
              <Button
                variant="outline"
                size="md"
                leftIcon={CheckCircle2}
                disabled
                className="w-full sm:w-auto opacity-80 cursor-default"
              >
                Workday Completed
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TodayAttendanceCard;
