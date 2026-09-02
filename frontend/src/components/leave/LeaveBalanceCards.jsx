import React from 'react';
import {
  CalendarDays,
  HeartPulse,
  Palmtree,
  Coffee,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Card, CardContent, Badge } from '../ui';

export const LeaveBalanceCards = ({ balance = null }) => {
  const cards = [
    {
      type: 'ANNUAL',
      title: 'Annual Leave',
      icon: Palmtree,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
      borderColor: 'border-emerald-200/70 dark:border-emerald-800/70',
      data: balance?.annual || { allocated: 18, used: 0, pending: 0, available: 18 },
    },
    {
      type: 'CASUAL',
      title: 'Casual Leave',
      icon: Coffee,
      iconColor: 'text-teal-600 dark:text-teal-400',
      bgColor: 'bg-teal-50 dark:bg-teal-950/40',
      borderColor: 'border-teal-200/70 dark:border-teal-800/70',
      data: balance?.casual || { allocated: 12, used: 0, pending: 0, available: 12 },
    },
    {
      type: 'SICK',
      title: 'Sick Leave',
      icon: HeartPulse,
      iconColor: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-50 dark:bg-rose-950/40',
      borderColor: 'border-rose-200/70 dark:border-rose-800/70',
      data: balance?.sick || { allocated: 10, used: 0, pending: 0, available: 10 },
    },
    {
      type: 'UNPAID',
      title: 'Unpaid Leave',
      icon: CalendarDays,
      iconColor: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40',
      borderColor: 'border-amber-200/70 dark:border-amber-800/70',
      data: balance?.unpaid || { used: 0, pending: 0, available: null },
      isUnpaid: true,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-foreground">Leave Balances ({balance?.year || new Date().getFullYear()})</h2>
          <p className="text-xs text-muted-foreground">
            Current year leave entitlements, logged usage, and available quotas
          </p>
        </div>

        {balance?.totalAvailable !== undefined && (
          <Badge variant="primary" size="md">
            {balance.totalAvailable} Paid Days Available
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card
              key={c.type}
              className={`border ${c.borderColor} shadow-subtle transition-all`}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground block">
                    {c.title}
                  </span>
                  <div className={`p-1.5 rounded-lg ${c.bgColor}`}>
                    <Icon className={`w-3.5 h-3.5 ${c.iconColor}`} />
                  </div>
                </div>

                {/* Primary Available Stat */}
                <div>
                  <span className="text-2xl font-bold tracking-tight text-foreground block font-mono">
                    {c.isUnpaid ? `${c.data.used}d` : `${c.data.available}d`}
                  </span>
                  <span className="text-[11px] text-muted-foreground block">
                    {c.isUnpaid ? 'Total logged unpaid days' : 'Available for booking'}
                  </span>
                </div>

                {/* Sub-breakdown: Used, Pending, Quota */}
                <div className="grid grid-cols-3 gap-1 pt-2 border-t border-border/60 text-[10px]">
                  {!c.isUnpaid ? (
                    <>
                      <div>
                        <span className="text-muted-foreground block uppercase font-semibold">Quota</span>
                        <span className="font-bold text-foreground font-mono">{c.data.allocated}d</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block uppercase font-semibold">Used</span>
                        <span className="font-bold text-foreground font-mono">{c.data.used}d</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block uppercase font-semibold">Pending</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">{c.data.pending}d</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <span className="text-muted-foreground block uppercase font-semibold">Used</span>
                        <span className="font-bold text-foreground font-mono">{c.data.used}d</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block uppercase font-semibold">Pending</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">{c.data.pending}d</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block uppercase font-semibold">Limit</span>
                        <span className="font-bold text-muted-foreground font-mono">No Cap</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default LeaveBalanceCards;
