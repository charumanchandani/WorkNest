import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, ListTodo, Flame } from 'lucide-react';
import { Card, CardContent } from '../ui';

export const TaskSummaryCards = ({ summary = null, isManagement = false }) => {
  const total = summary?.total || 0;
  const inProgress = summary?.inProgress || 0;
  const completed = summary?.completed || 0;
  const overdue = summary?.overdue || 0;
  const todo = summary?.todo || 0;
  const dueSoon = summary?.dueSoon || 0;

  const cards = [
    {
      title: 'Total Tasks',
      value: total,
      subtitle: isManagement ? 'Assigned in scope' : 'Assigned to you',
      icon: ListTodo,
      textColor: 'text-foreground',
      bgColor: 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400',
    },
    {
      title: 'In Progress',
      value: inProgress,
      subtitle: `${todo} pending in backlog`,
      icon: Clock,
      textColor: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
    },
    {
      title: 'Completed',
      value: completed,
      subtitle: 'Successfully finished',
      icon: CheckCircle2,
      textColor: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
    },
    {
      title: isManagement ? 'Overdue Tasks' : 'Overdue / Due Soon',
      value: isManagement ? overdue : overdue > 0 ? `${overdue} overdue` : `${dueSoon} due soon`,
      subtitle: isManagement
        ? 'Passed expected due date'
        : overdue > 0
        ? 'Requires immediate attention'
        : 'Next 3 workdays',
      icon: overdue > 0 ? AlertTriangle : Flame,
      textColor: overdue > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-indigo-600 dark:text-indigo-400',
      bgColor: overdue > 0
        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
        : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="border-border shadow-subtle">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-1 min-w-0">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block truncate">
                  {card.title}
                </span>
                <span className={`text-2xl font-bold font-mono ${card.textColor} block leading-none`}>
                  {card.value}
                </span>
                <span className="text-[11px] text-muted-foreground block truncate">
                  {card.subtitle}
                </span>
              </div>

              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${card.bgColor}`}>
                <Icon className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default TaskSummaryCards;
