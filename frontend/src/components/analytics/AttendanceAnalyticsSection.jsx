import React from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Clock3,
  CalendarOff,
  UserX,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { Card, CardHeader, CardContent, Badge, EmptyState } from '../ui';

export const AttendanceAnalyticsSection = ({ data }) => {
  const summary = data?.summary || {};
  const trend = data?.trend || [];

  const {
    totalRecords = 0,
    presentCount = 0,
    lateCount = 0,
    halfDayCount = 0,
    onLeaveCount = 0,
    totalHours = 0,
    averageHoursPerDay = 0,
    attendanceRate = 0,
  } = summary;

  // Format date for chart labels
  const formattedChartData = trend.map((item) => {
    const parts = item.date.split('-');
    const label = `${parts[1]}/${parts[2]}`;
    return {
      ...item,
      shortDate: label,
    };
  });

  return (
    <div className="space-y-6">
      {/* Attendance Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-card border border-border rounded-xl p-3.5 space-y-1 shadow-subtle">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Rate</span>
            <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="text-xl font-bold tracking-tight text-foreground">
            {attendanceRate}%
          </div>
          <div className="text-[11px] text-muted-foreground">
            {totalRecords} records tracked
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-3.5 space-y-1 shadow-subtle">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Present</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-xl font-bold tracking-tight text-foreground">
            {presentCount}
          </div>
          <div className="text-[11px] text-muted-foreground">On-time check-ins</div>
        </div>

        <div className="bg-card border border-border rounded-xl p-3.5 space-y-1 shadow-subtle">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Late</span>
            <Clock3 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-xl font-bold tracking-tight text-foreground">
            {lateCount}
          </div>
          <div className="text-[11px] text-muted-foreground">Past 09:30 AM</div>
        </div>

        <div className="bg-card border border-border rounded-xl p-3.5 space-y-1 shadow-subtle">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Half-Day</span>
            <AlertCircle className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="text-xl font-bold tracking-tight text-foreground">
            {halfDayCount}
          </div>
          <div className="text-[11px] text-muted-foreground">&lt; 5 hours</div>
        </div>

        <div className="bg-card border border-border rounded-xl p-3.5 space-y-1 shadow-subtle">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>On Leave</span>
            <CalendarOff className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-xl font-bold tracking-tight text-foreground">
            {onLeaveCount}
          </div>
          <div className="text-[11px] text-muted-foreground">Approved leave</div>
        </div>

        <div className="bg-card border border-border rounded-xl p-3.5 space-y-1 shadow-subtle">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Avg Hours</span>
            <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="text-xl font-bold tracking-tight text-foreground">
            {averageHoursPerDay}h
          </div>
          <div className="text-[11px] text-muted-foreground">{totalHours}h total</div>
        </div>
      </div>

      {/* Daily Attendance Trend Chart */}
      <Card className="shadow-subtle">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-foreground">
                Attendance Daily Trend
              </h2>
              <p className="text-xs text-muted-foreground">
                Daily breakdown of present, late, half-day, and on-leave logs.
              </p>
            </div>
            <Badge variant="primary" size="sm">
              {totalRecords} Total Shifts
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          {formattedChartData.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={Clock}
                title="No Attendance Data"
                description="No attendance records found for the selected date range and filter criteria."
              />
            </div>
          ) : (
            <div className="w-full h-72 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formattedChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis
                    dataKey="shortDate"
                    tick={{ fontSize: 11 }}
                    stroke="#888888"
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11 }}
                    stroke="#888888"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                  <Bar dataKey="present" name="Present" fill="#10b981" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="late" name="Late" fill="#f59e0b" stackId="a" />
                  <Bar dataKey="halfDay" name="Half-Day" fill="#0284c7" stackId="a" />
                  <Bar dataKey="onLeave" name="On Leave" fill="#6366f1" stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceAnalyticsSection;
