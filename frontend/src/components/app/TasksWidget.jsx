import React, { useState } from 'react';
import { CheckSquare, Clock, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Checkbox } from '../ui';

export const TasksWidget = ({ initialTasks = [], onTasksClick }) => {
  const [tasks, setTasks] = useState(initialTasks);

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextCompleted = !t.completed;
          return {
            ...t,
            completed: nextCompleted,
            status: nextCompleted ? 'Completed' : 'In Progress',
          };
        }
        return t;
      })
    );
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High':
        return <Badge variant="destructive" size="sm">High</Badge>;
      case 'Normal':
        return <Badge variant="primary" size="sm">Normal</Badge>;
      default:
        return <Badge variant="outline" size="sm">Low</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return <Badge variant="success" size="sm">Completed</Badge>;
      case 'In Progress':
        return <Badge variant="warning" size="sm">In Progress</Badge>;
      default:
        return <Badge variant="outline" size="sm">To Do</Badge>;
    }
  };

  return (
    <Card className="shadow-subtle border-border h-full flex flex-col">
      <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between border-b border-border">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <CardTitle className="text-sm font-bold">My Assigned Tasks</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Priority deliverables & deadlines
          </CardDescription>
        </div>

        <button
          type="button"
          onClick={() => onTasksClick && onTasksClick('Task Management', 'Phase 9')}
          className="text-xs text-teal-600 dark:text-teal-400 font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded px-1"
        >
          View All ({tasks.length})
        </button>
      </CardHeader>

      <CardContent className="p-5 space-y-2.5 flex-1">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
              task.completed
                ? 'bg-secondary/20 border-border/40 opacity-70'
                : 'bg-card border-border/70 hover:border-teal-500/40 shadow-sm'
            }`}
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className="mt-0.5">
                <Checkbox
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  aria-label={`Mark task ${task.title} as completed`}
                />
              </div>

              <div className="space-y-1 min-w-0">
                <span
                  className={`text-xs font-semibold block leading-snug truncate ${
                    task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                  }`}
                >
                  {task.title}
                </span>

                <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="bg-secondary px-1.5 py-0.5 rounded font-medium">
                    {task.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    {task.dueDate}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 shrink-0">
              {getPriorityBadge(task.priority)}
              {getStatusBadge(task.status)}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default TasksWidget;
