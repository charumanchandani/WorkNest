import React from 'react';
import { Calendar, Plus, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button } from '../ui';

export const LeaveWidget = ({ leaveData = [], pendingCount = 1, onRequestClick }) => {
  return (
    <Card className="shadow-subtle border-border h-full flex flex-col">
      <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between border-b border-border">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <CardTitle className="text-sm font-bold">Leave Balance & Allowances</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Annual entitlements & usage
          </CardDescription>
        </div>

        <Button
          variant="outline"
          size="sm"
          leftIcon={Plus}
          onClick={() => onRequestClick && onRequestClick('Apply for Leave', 'Phase 8')}
        >
          Apply
        </Button>
      </CardHeader>

      <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
        {/* Category breakdown bars */}
        <div className="space-y-3">
          {leaveData.map((item) => {
            const percentage = Math.round((item.remaining / item.total) * 100);

            return (
              <div key={item.type} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">{item.type}</span>
                  <span className="text-muted-foreground font-mono">
                    <strong className="text-foreground">{item.remaining}</strong> / {item.total} days
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full bg-teal-600 transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Pending Request Notice */}
        <div className="p-3 rounded-lg bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              {pendingCount} pending request{pendingCount > 1 ? 's' : ''} (Sep 14, Casual)
            </span>
          </div>
          <Badge variant="warning" size="sm">
            In Review
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeaveWidget;
