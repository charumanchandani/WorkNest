import React from 'react';
import { Calendar, CheckCircle2, Clock, XCircle, Ban, TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { Card, CardHeader, CardContent, EmptyState } from '../ui';

const LEAVE_COLORS = {
  ANNUAL: '#0d9488', // Teal
  CASUAL: '#0284c7', // Sky
  SICK: '#f59e0b', // Amber
  UNPAID: '#64748b', // Slate
};

export const LeaveAnalyticsSection = ({ data }) => {
  const summary = data?.summary || {};
  const byType = data?.byType || {};
  const departmentUsage = data?.departmentUsage || [];

  const {
    totalRequests = 0,
    pending = 0,
    approved = 0,
    rejected = 0,
    cancelled = 0,
    totalApprovedDays = 0,
    mostUsedType = 'None',
  } = summary;

  // Prepare Pie Chart data for leave types
  const typeChartData = Object.entries(byType)
    .map(([type, val]) => ({
      name: type.charAt(0) + type.slice(1).toLowerCase(),
      typeKey: type,
      days: val.days || 0,
      count: val.count || 0,
    }))
    .filter((d) => d.days > 0 || d.count > 0);

  const hasData = totalRequests > 0 || totalApprovedDays > 0;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-card border border-border rounded-xl p-3.5 space-y-1 shadow-subtle">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Approved Days</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-xl font-bold tracking-tight text-foreground">
            {totalApprovedDays}
          </div>
          <div className="text-[11px] text-muted-foreground">Total working days</div>
        </div>

        <div className="bg-card border border-border rounded-xl p-3.5 space-y-1 shadow-subtle">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Pending</span>
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-xl font-bold tracking-tight text-foreground">
            {pending}
          </div>
          <div className="text-[11px] text-muted-foreground">Awaiting review</div>
        </div>

        <div className="bg-card border border-border rounded-xl p-3.5 space-y-1 shadow-subtle">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Approved</span>
            <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="text-xl font-bold tracking-tight text-foreground">
            {approved}
          </div>
          <div className="text-[11px] text-muted-foreground">Requests granted</div>
        </div>

        <div className="bg-card border border-border rounded-xl p-3.5 space-y-1 shadow-subtle">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Rejected</span>
            <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="text-xl font-bold tracking-tight text-foreground">
            {rejected}
          </div>
          <div className="text-[11px] text-muted-foreground">Declined requests</div>
        </div>

        <div className="bg-card border border-border rounded-xl p-3.5 space-y-1 shadow-subtle">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Cancelled</span>
            <Ban className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="text-xl font-bold tracking-tight text-foreground">
            {cancelled}
          </div>
          <div className="text-[11px] text-muted-foreground">Withdrawn by user</div>
        </div>

        <div className="bg-card border border-border rounded-xl p-3.5 space-y-1 shadow-subtle">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Top Type</span>
            <TrendingUp className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="text-base font-bold tracking-tight text-foreground truncate">
            {mostUsedType}
          </div>
          <div className="text-[11px] text-muted-foreground">Highest usage</div>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut Chart: Leave Days by Type */}
        <Card className="shadow-subtle">
          <CardHeader className="pb-2">
            <h2 className="text-base font-bold text-foreground">Leave Distribution by Type</h2>
            <p className="text-xs text-muted-foreground">
              Proportion of approved leave days across categories.
            </p>
          </CardHeader>
          <CardContent>
            {!hasData || typeChartData.length === 0 ? (
              <div className="py-12">
                <EmptyState
                  icon={Calendar}
                  title="No Leave Records"
                  description="No approved leave requests found for the selected period."
                />
              </div>
            ) : (
              <div className="w-full h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typeChartData}
                      dataKey="days"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                    >
                      {typeChartData.map((entry) => (
                        <Cell
                          key={entry.typeKey}
                          fill={LEAVE_COLORS[entry.typeKey] || '#94a3b8'}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val, name, item) => [
                        `${val} Days (${item.payload.count} requests)`,
                        name,
                      ]}
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Department Usage Comparison */}
        <Card className="shadow-subtle">
          <CardHeader className="pb-2">
            <h2 className="text-base font-bold text-foreground">Department Leave Usage</h2>
            <p className="text-xs text-muted-foreground">
              Total approved absence days utilized per department.
            </p>
          </CardHeader>
          <CardContent>
            {departmentUsage.length === 0 ? (
              <div className="py-12">
                <EmptyState
                  icon={Calendar}
                  title="No Department Breakdown"
                  description="No departmental leave usage logged in this time range."
                />
              </div>
            ) : (
              <div className="w-full h-64 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentUsage} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#888888" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#888888" />
                    <Tooltip
                      formatter={(val) => [`${val} Days`, 'Approved Leave']}
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="approvedDays" name="Approved Days" fill="#0d9488" radius={[4, 4, 0, 0]} />
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

export default LeaveAnalyticsSection;
