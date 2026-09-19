import React from 'react';
import { Building2, Users, CheckSquare, Clock, Calendar, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardContent, Badge, EmptyState } from '../ui';

export const DepartmentAnalyticsSection = ({ data }) => {
  const departments = data?.departments || [];

  if (departments.length === 0) {
    return (
      <Card className="shadow-subtle">
        <CardContent className="py-12">
          <EmptyState
            icon={Building2}
            title="No Department Analytics Available"
            description="No department performance records found in your administrative scope."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept) => (
          <Card key={dept.id} className="shadow-subtle hover:border-teal-500/30 transition-colors">
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-foreground">
                      {dept.name}
                    </h3>
                    <Badge variant="secondary" size="sm">
                      {dept.code}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    Lead: {dept.manager?.name || 'Unassigned'}
                  </p>
                </div>
                <Badge
                  variant={dept.status === 'ACTIVE' ? 'success' : 'secondary'}
                  size="sm"
                >
                  {dept.status}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-3.5 text-xs">
              {/* Workforce numbers */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Headcount
                </span>
                <span className="font-semibold text-foreground">
                  {dept.activeEmployeeCount} active / {dept.employeeCount} total
                </span>
              </div>

              {/* Task workload */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5" /> Task Completion
                </span>
                <span className="font-semibold text-foreground">
                  {dept.taskWorkload.completionRate}% ({dept.taskWorkload.completed}/{dept.taskWorkload.total})
                </span>
              </div>

              {/* Overdue Tasks Alert if any */}
              {dept.taskWorkload.overdue > 0 && (
                <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 font-medium">
                  <span>Overdue Tasks</span>
                  <span>{dept.taskWorkload.overdue} tasks</span>
                </div>
              )}

              {/* Attendance today */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Attendance Today
                </span>
                <span className="font-semibold text-teal-600 dark:text-teal-400">
                  {dept.attendanceRate}%
                </span>
              </div>

              {/* Leave days this month */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Leave Used (Month)
                </span>
                <span className="font-semibold text-foreground">
                  {dept.approvedLeaveDays} days
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DepartmentAnalyticsSection;
