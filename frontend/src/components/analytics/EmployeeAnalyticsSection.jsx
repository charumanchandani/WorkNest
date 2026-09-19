import React from 'react';
import { Users, UserCheck, UserX, Calendar, Building2, Briefcase } from 'lucide-react';
import { Card, CardHeader, CardContent, Badge, EmptyState } from '../ui';

export const EmployeeAnalyticsSection = ({ data }) => {
  const summary = data?.summary || {};
  const byRole = data?.byRole || {};
  const byDepartment = data?.byDepartment || [];
  const recentJoins = data?.recentJoins || [];

  const { totalEmployees = 0, active = 0, inactive = 0 } = summary;

  if (totalEmployees === 0) {
    return (
      <Card className="shadow-subtle">
        <CardContent className="py-12">
          <EmptyState
            icon={Users}
            title="No Workforce Data Available"
            description="No employee records found in your scoped directory."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Headcount KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 shadow-subtle flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground block">
              Total Workforce
            </span>
            <span className="text-2xl font-bold tracking-tight text-foreground block">
              {totalEmployees}
            </span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-subtle flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground block">
              Active Employees
            </span>
            <span className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 block">
              {active}
            </span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-subtle flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-secondary/80 text-muted-foreground flex items-center justify-center shrink-0">
            <UserX className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground block">
              Inactive / Offboarded
            </span>
            <span className="text-2xl font-bold tracking-tight text-muted-foreground block">
              {inactive}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Headcount Breakdown */}
        <Card className="shadow-subtle">
          <CardHeader className="pb-3">
            <h2 className="text-base font-bold text-foreground">Department Headcount</h2>
            <p className="text-xs text-muted-foreground">
              Active staffing across organizational units.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {byDepartment.length === 0 ? (
              <p className="text-xs text-muted-foreground">No departmental assignments found.</p>
            ) : (
              byDepartment.map((dept) => (
                <div
                  key={dept.name}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/30 text-xs"
                >
                  <span className="font-medium text-foreground flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    {dept.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="primary" size="sm">
                      {dept.activeCount} Active
                    </Badge>
                    <span className="text-muted-foreground text-[11px]">
                      ({dept.count} total)
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Roles and Recent Joins */}
        <div className="space-y-6">
          {/* Roles Breakdown */}
          <Card className="shadow-subtle">
            <CardHeader className="pb-3">
              <h2 className="text-base font-bold text-foreground">Role Distribution</h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 rounded-lg bg-secondary/40">
                  <span className="text-[11px] text-muted-foreground block">Administrators</span>
                  <span className="text-lg font-bold text-foreground block mt-0.5">
                    {byRole.ADMIN || 0}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-secondary/40">
                  <span className="text-[11px] text-muted-foreground block">Managers</span>
                  <span className="text-lg font-bold text-foreground block mt-0.5">
                    {byRole.MANAGER || 0}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-secondary/40">
                  <span className="text-[11px] text-muted-foreground block">Employees</span>
                  <span className="text-lg font-bold text-foreground block mt-0.5">
                    {byRole.EMPLOYEE || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Joins */}
          <Card className="shadow-subtle">
            <CardHeader className="pb-3">
              <h2 className="text-base font-bold text-foreground">Recent Additions</h2>
              <p className="text-xs text-muted-foreground">Newest colleagues joined.</p>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {recentJoins.length === 0 ? (
                <p className="text-xs text-muted-foreground">No recent join dates recorded.</p>
              ) : (
                recentJoins.map((join) => (
                  <div
                    key={join.id}
                    className="flex items-center justify-between text-xs py-1.5 border-b border-border/50 last:border-0"
                  >
                    <div>
                      <span className="font-semibold text-foreground block">
                        {join.name}
                      </span>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {join.jobTitle} &bull; {join.department}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(join.joiningDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAnalyticsSection;
