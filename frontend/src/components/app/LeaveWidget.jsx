import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Plus, Clock, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button } from '../ui';

export const LeaveWidget = ({ balance = null, error = '' }) => {
  const annual = balance?.annual || { allocated: 18, used: 0, pending: 0, available: 18 };
  const casual = balance?.casual || { allocated: 12, used: 0, pending: 0, available: 12 };
  const sick = balance?.sick || { allocated: 10, used: 0, pending: 0, available: 10 };

  const totalPending = (annual.pending || 0) + (casual.pending || 0) + (sick.pending || 0) + (balance?.unpaid?.pending || 0);

  const categories = [
    {
      name: 'Annual Leave',
      allocated: annual.allocated,
      available: annual.available,
      used: annual.used,
      pending: annual.pending,
      color: 'bg-emerald-600',
    },
    {
      name: 'Casual Leave',
      allocated: casual.allocated,
      available: casual.available,
      used: casual.used,
      pending: casual.pending,
      color: 'bg-teal-600',
    },
    {
      name: 'Sick Leave',
      allocated: sick.allocated,
      available: sick.available,
      used: sick.used,
      pending: sick.pending,
      color: 'bg-rose-600',
    },
  ];

  return (
    <Card className="shadow-subtle border-border h-full flex flex-col">
      <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between border-b border-border">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <CardTitle className="text-sm font-bold">Leave Balance &amp; Allowances</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Annual entitlements ({balance?.year || new Date().getFullYear()})
          </CardDescription>
        </div>

        <Link to="/app/leave">
          <Button
            variant="outline"
            size="sm"
            leftIcon={Plus}
            className="text-xs py-1"
          >
            Apply
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
        {error ? (
          <div className="p-3 rounded-lg bg-secondary/40 border border-border text-xs text-muted-foreground">
            Unable to fetch real-time leave balance. Visit the leave page for full records.
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((item) => {
              const percentage = Math.min(
                100,
                Math.max(0, Math.round((item.available / (item.allocated || 1)) * 100))
              );

              return (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">{item.name}</span>
                    <span className="text-muted-foreground font-mono">
                      <strong className="text-foreground">{item.available}</strong> / {item.allocated} days
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color} transition-all duration-300`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pending Request Banner or Summary CTA */}
        {totalPending > 0 ? (
          <div className="p-3 rounded-lg bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                {totalPending} working day{totalPending > 1 ? 's' : ''} in review
              </span>
            </div>
            <Badge variant="warning" size="sm">
              Pending
            </Badge>
          </div>
        ) : (
          <div className="p-2.5 rounded-lg bg-secondary/30 border border-border/70 flex items-center justify-between text-xs text-muted-foreground">
            <span>All leave quotas active and up to date</span>
            <Link
              to="/app/leave"
              className="text-teal-600 dark:text-teal-400 font-medium hover:underline inline-flex items-center gap-1"
            >
              <span>View details</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeaveWidget;
