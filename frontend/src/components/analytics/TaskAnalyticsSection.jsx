import React from 'react';
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Hourglass,
  Layers,
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
import { Card, CardHeader, CardContent, EmptyState } from '../ui';

const PRIORITY_LABELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};

export const TaskAnalyticsSection = ({ data }) => {
  const summary = data?.summary || {};
  const byPriority = data?.byPriority || {};
  const departmentWorkload = data?.departmentWorkload || [];

  const {
    totalTasks = 0,
    todo = 0,
    inProgress = 0,
    completed = 0,
    cancelled = 0,
    overdue = 0,
    completionRate = 0,
    avgCompletionDays = 0,
  } = summary;

  const priorityChartData = Object.entries(byPriority).map(([key, val]) => ({
    priority: PRIORITY_LABELS[key] || key,
    total: val.total || 0,
    completed: val.completed || 0,
    open: (val.total || 0) - (val.completed || 0),
  }));

  const hasTasks = totalTasks > 0;

  return (
    <div className="space-y-6">
      {/* Summary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-card border border-border rounded-xl p-3.5 space-y-1 shadow-subtle">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Completion</span>
            <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="text-xl font-bold tracking-tight text-foreground">
            {completionRate}%
          </div>
          <div className="text-[11px] text-muted-foreground">{completed} of {totalTasks - cancelled} closed</div>
        </div>

        <div className="bg-card border border-border rounded-xl p-3.5 space-y-1 shadow-subtle">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>In Progress</span>
            <Hourglass className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="text-xl font-bold tracking-tight text-foreground">
            {inProgress}
          </div>
          <div className="text-[11px] text-muted-foreground">Active work</div>
        </div>

        <div className="bg-card border border-border rounded-xl p-3.5 space-y-1 shadow-subtle">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>To Do</span>
            <Layers className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="text-xl font-bold tracking-tight text-foreground">
            {todo}
          </div>
          <div className="text-[11px] text-muted-foreground">Pending start</div>
        </div>

        <div className="bg-card border border-border rounded-xl p-3.5 space-y-1 shadow-subtle">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Overdue</span>
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="text-xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
            {overdue}
          </div>
          <div className="text-[11px] text-muted-foreground">Passed due date</div>
        </div>

        <div className="bg-card border border-border rounded-xl p-3.5 space-y-1 shadow-subtle">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Completed</span>
            <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-xl font-bold tracking-tight text-foreground">
            {completed}
          </div>
          <div className="text-[11px] text-muted-foreground">Finished deliverables</div>
        </div>

        <div className="bg-card border border-border rounded-xl p-3.5 space-y-1 shadow-subtle">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Avg Turnaround</span>
            <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="text-xl font-bold tracking-tight text-foreground">
            {avgCompletionDays}d
          </div>
          <div className="text-[11px] text-muted-foreground">Created to done</div>
        </div>
      </div>

      {/* Task Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Distribution */}
        <Card className="shadow-subtle">
          <CardHeader className="pb-2">
            <h2 className="text-base font-bold text-foreground">Tasks by Priority</h2>
            <p className="text-xs text-muted-foreground">
              Open vs completed items classified by priority severity.
            </p>
          </CardHeader>
          <CardContent>
            {!hasTasks ? (
              <div className="py-12">
                <EmptyState
                  icon={CheckSquare}
                  title="No Tasks Found"
                  description="No tasks match the active date filters or assigned workload."
                />
              </div>
            ) : (
              <div className="w-full h-64 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priorityChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="priority" tick={{ fontSize: 11 }} stroke="#888888" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#888888" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[0, 0, 0, 0]} stackId="a" />
                    <Bar dataKey="open" name="Open / Active" fill="#0d9488" radius={[4, 4, 0, 0]} stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Department Workload Distribution */}
        <Card className="shadow-subtle">
          <CardHeader className="pb-2">
            <h2 className="text-base font-bold text-foreground">Department Task Workload</h2>
            <p className="text-xs text-muted-foreground">
              Workload and completion progress broken down by department.
            </p>
          </CardHeader>
          <CardContent>
            {departmentWorkload.length === 0 ? (
              <div className="py-12">
                <EmptyState
                  icon={Layers}
                  title="No Department Workload"
                  description="No departmental task assignments found in this date range."
                />
              </div>
            ) : (
              <div className="w-full h-64 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentWorkload} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#888888" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#888888" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="completed" name="Completed" fill="#10b981" stackId="b" />
                    <Bar dataKey="open" name="Open" fill="#0284c7" stackId="b" />
                    <Bar dataKey="overdue" name="Overdue" fill="#f43f5e" stackId="b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TaskAnalyticsSection;
