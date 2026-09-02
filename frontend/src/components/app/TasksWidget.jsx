import React from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, Clock, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from '../ui';

export const TasksWidget = ({ tasks = [], summary = null, error = '' }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'URGENT':
        return <Badge variant="destructive" size="sm">Urgent</Badge>;
      case 'HIGH':
        return <Badge variant="warning" size="sm">High</Badge>;
      case 'MEDIUM':
        return <Badge variant="primary" size="sm">Medium</Badge>;
      case 'LOW':
        return <Badge variant="outline" size="sm">Low</Badge>;
      default:
        return <Badge variant="outline" size="sm">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'TODO':
        return <Badge variant="outline" size="sm" dot>To Do</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="warning" size="sm" dot>In Progress</Badge>;
      case 'COMPLETED':
        return <Badge variant="success" size="sm" dot>Done</Badge>;
      case 'CANCELLED':
        return <Badge variant="outline" size="sm">Cancelled</Badge>;
      default:
        return <Badge variant="outline" size="sm">{status}</Badge>;
    }
  };

  const activeCount = summary?.active || 0;
  const overdueCount = summary?.overdue || 0;
  const dueSoonCount = summary?.dueSoon || 0;
  const completedCount = summary?.completed || 0;

  return (
    <Card className="shadow-subtle border-border h-full flex flex-col">
      <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between border-b border-border">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <CardTitle className="text-sm font-bold">My Assigned Tasks</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Priority deliverables &amp; active queue
          </CardDescription>
        </div>

        <Link
          to="/app/tasks"
          className="text-xs text-teal-600 dark:text-teal-400 font-medium hover:underline inline-flex items-center gap-1"
        >
          <span>View All ({summary?.total || tasks.length})</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </CardHeader>

      <CardContent className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
        {/* Workload Metric Pills */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2 rounded-lg bg-secondary/40 border border-border">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Active</span>
            <span className="font-bold text-foreground font-mono">{activeCount}</span>
          </div>
          <div className="p-2 rounded-lg bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40">
            <span className="text-[10px] text-amber-700 dark:text-amber-400 uppercase font-semibold block">Due Soon</span>
            <span className="font-bold text-amber-800 dark:text-amber-300 font-mono">{dueSoonCount}</span>
          </div>
          <div className="p-2 rounded-lg bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40">
            <span className="text-[10px] text-rose-700 dark:text-rose-400 uppercase font-semibold block">Overdue</span>
            <span className="font-bold text-rose-800 dark:text-rose-300 font-mono">{overdueCount}</span>
          </div>
          <div className="p-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40">
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 uppercase font-semibold block">Done</span>
            <span className="font-bold text-emerald-800 dark:text-emerald-300 font-mono">{completedCount}</span>
          </div>
        </div>

        {/* Task Items List */}
        {error ? (
          <div className="p-3 rounded-lg bg-secondary/40 border border-border text-xs text-muted-foreground">
            Unable to load real-time tasks. Check the tasks page for complete records.
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground border border-border/60 rounded-xl bg-secondary/10">
            No active tasks currently assigned to you.
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.slice(0, 4).map((task) => (
              <Link
                key={task.id}
                to={`/app/tasks/${task.id}`}
                className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 group ${
                  task.status === 'COMPLETED'
                    ? 'bg-secondary/20 border-border/40 opacity-70'
                    : 'bg-card border-border/70 hover:border-teal-500/40 shadow-sm'
                }`}
              >
                <div className="space-y-1 min-w-0">
                  <span
                    className={`text-xs font-semibold block leading-snug truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors ${
                      task.status === 'COMPLETED' ? 'line-through text-muted-foreground' : 'text-foreground'
                    }`}
                  >
                    {task.title}
                  </span>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      {formatDate(task.dueDate)}
                    </span>
                    {task.isOverdue && (
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950 px-1.5 py-0.2 rounded border border-rose-200">
                        Overdue
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {getPriorityBadge(task.priority)}
                  {getStatusBadge(task.status)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TasksWidget;
