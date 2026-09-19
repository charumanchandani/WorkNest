import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  Users,
  Building2,
  Clock,
  Calendar,
  CheckSquare,
  Activity,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../hooks';
import { Alert, Spinner, Badge } from '../components/ui';
import {
  AnalyticsFilterBar,
  MetricCard,
  AttendanceAnalyticsSection,
  LeaveAnalyticsSection,
  TaskAnalyticsSection,
  DepartmentAnalyticsSection,
  EmployeeAnalyticsSection,
} from '../components/analytics';
import analyticsService from '../services/analyticsService';

export const AnalyticsPage = () => {
  const { user } = useAuth();
  const isManagerOrAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const isAdmin = user?.role === 'ADMIN';

  // Navigation tab
  const [activeTab, setActiveTab] = useState('overview');

  // Filter state
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    department: '',
  });

  // Section data states
  const [overviewData, setOverviewData] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [leaveData, setLeaveData] = useState(null);
  const [taskData, setTaskData] = useState(null);
  const [departmentData, setDepartmentData] = useState(null);
  const [employeeData, setEmployeeData] = useState(null);

  // Loading & error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch overview
  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await analyticsService.getOverviewAnalytics(filters);
      if (res?.data) {
        setOverviewData(res.data.data || res.data);
      }
    } catch (err) {
      setError(err.formattedMessage || 'Failed to load analytics overview.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch tab-specific data on-demand
  const fetchTabData = useCallback(async (tabKey) => {
    try {
      setLoading(true);
      setError('');

      switch (tabKey) {
        case 'attendance': {
          const res = await analyticsService.getAttendanceAnalytics(filters);
          if (res?.data) setAttendanceData(res.data.data || res.data);
          break;
        }
        case 'leave': {
          const res = await analyticsService.getLeaveAnalytics(filters);
          if (res?.data) setLeaveData(res.data.data || res.data);
          break;
        }
        case 'tasks': {
          const res = await analyticsService.getTaskAnalytics(filters);
          if (res?.data) setTaskData(res.data.data || res.data);
          break;
        }
        case 'departments': {
          if (isManagerOrAdmin) {
            const res = await analyticsService.getDepartmentAnalytics(filters);
            if (res?.data) setDepartmentData(res.data.data || res.data);
          }
          break;
        }
        case 'employees': {
          if (isManagerOrAdmin) {
            const res = await analyticsService.getEmployeeAnalytics(filters);
            if (res?.data) setEmployeeData(res.data.data || res.data);
          }
          break;
        }
        case 'overview':
        default:
          await fetchOverview();
          break;
      }
    } catch (err) {
      setError(err.formattedMessage || `Failed to load ${tabKey} analytics.`);
    } finally {
      setLoading(false);
    }
  }, [filters, isManagerOrAdmin, fetchOverview]);

  // Trigger data fetch whenever active tab or filters change
  useEffect(() => {
    fetchTabData(activeTab);
  }, [activeTab, filters, fetchTabData]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleRefresh = () => {
    fetchTabData(activeTab);
  };

  const tabs = [
    { id: 'overview', label: 'Executive Overview', icon: TrendingUp },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'leave', label: 'Leave Usage', icon: Calendar },
    { id: 'tasks', label: 'Tasks & Workload', icon: CheckSquare },
    ...(isManagerOrAdmin
      ? [
          { id: 'departments', label: 'Departments', icon: Building2 },
          { id: 'employees', label: 'Workforce', icon: Users },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Analytics & Insights
            </h1>
            <Badge
              variant={
                user?.role === 'ADMIN'
                  ? 'destructive'
                  : user?.role === 'MANAGER'
                  ? 'warning'
                  : 'primary'
              }
              size="md"
            >
              {user?.role === 'ADMIN'
                ? 'Organization Scope'
                : user?.role === 'MANAGER'
                ? 'Managed Team Scope'
                : 'Personal Scope'}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Real-time workplace metrics, operational trends, and workforce performance.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <AnalyticsFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onRefresh={handleRefresh}
        loading={loading}
        showDepartmentFilter={isManagerOrAdmin}
      />

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
          <span>{error}</span>
        </Alert>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                isActive
                  ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/70 dark:border-teal-800/70'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      {loading && !overviewData && !attendanceData && !leaveData && !taskData ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Spinner size="lg" />
          <p className="text-xs text-muted-foreground">Calculating live metrics...</p>
        </div>
      ) : (
        <div>
          {/* Tab 1: Executive Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Overview Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Workforce / Attendance */}
                {isManagerOrAdmin ? (
                  <MetricCard
                    title={isAdmin ? 'Total Staff' : 'Team Members'}
                    value={overviewData?.employees?.total ?? 0}
                    subtext={`${overviewData?.employees?.active ?? 0} Active members`}
                    icon={Users}
                    badgeText={isAdmin ? 'Organization' : 'Team'}
                    badgeVariant="secondary"
                    onClick={() => setActiveTab('employees')}
                  />
                ) : (
                  <MetricCard
                    title="My Attendance Today"
                    value={
                      overviewData?.attendance?.todayRecord?.status || 'Not Checked In'
                    }
                    subtext={`${overviewData?.attendance?.periodPresentDays ?? 0} present days this period`}
                    icon={Clock}
                    badgeText="Personal"
                    badgeVariant="primary"
                    onClick={() => setActiveTab('attendance')}
                  />
                )}

                {/* 2. Attendance / Rate */}
                <MetricCard
                  title="Attendance Rate"
                  value={
                    overviewData?.attendance?.attendanceRate !== undefined
                      ? `${overviewData.attendance.attendanceRate}%`
                      : `${overviewData?.attendance?.periodPresentDays ?? 0} Days`
                  }
                  subtext={
                    isManagerOrAdmin
                      ? `${overviewData?.attendance?.todayPresent ?? 0} checked in today`
                      : `${overviewData?.attendance?.periodTotalRecords ?? 0} logged shifts`
                  }
                  icon={Clock}
                  badgeText="Live"
                  badgeVariant="success"
                  onClick={() => setActiveTab('attendance')}
                />

                {/* 3. Leave Requests / Balance */}
                <MetricCard
                  title={isManagerOrAdmin ? 'Pending Leaves' : 'Leave Requests'}
                  value={`${overviewData?.leaves?.pending ?? 0} Pending`}
                  subtext={
                    isManagerOrAdmin
                      ? 'Awaiting review'
                      : `${overviewData?.leaves?.approvedDaysInPeriod ?? 0} approved days in period`
                  }
                  icon={Calendar}
                  badgeText="Approvals"
                  badgeVariant={overviewData?.leaves?.pending > 0 ? 'warning' : 'secondary'}
                  onClick={() => setActiveTab('leave')}
                />

                {/* 4. Tasks Summary */}
                <MetricCard
                  title="Active Tasks"
                  value={`${overviewData?.tasks?.open ?? 0} Open`}
                  subtext={`${overviewData?.tasks?.overdue ?? 0} overdue items`}
                  icon={CheckSquare}
                  badgeText={
                    overviewData?.tasks?.overdue > 0 ? 'Action Needed' : 'Standard'
                  }
                  badgeVariant={
                    overviewData?.tasks?.overdue > 0 ? 'destructive' : 'primary'
                  }
                  onClick={() => setActiveTab('tasks')}
                />
              </div>

              {/* Quick Summary Panels */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-xl p-5 shadow-subtle space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      Task Pipeline Health
                    </h2>
                    <span className="text-xs text-muted-foreground">
                      {overviewData?.tasks?.total ?? 0} total tasks
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center pt-2">
                    <div className="p-3 rounded-lg bg-secondary/30">
                      <span className="text-[11px] text-muted-foreground block">Open</span>
                      <span className="text-lg font-bold text-foreground block">
                        {overviewData?.tasks?.open ?? 0}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/30">
                      <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold block">
                        Overdue
                      </span>
                      <span className="text-lg font-bold text-rose-600 dark:text-rose-400 block">
                        {overviewData?.tasks?.overdue ?? 0}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/30">
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                        Completed
                      </span>
                      <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 block">
                        {overviewData?.tasks?.completed ?? 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-5 shadow-subtle space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Activity className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      Activity Velocity
                    </h2>
                    <Badge variant="primary" size="sm">
                      {overviewData?.activities?.recentCount ?? 0} Events
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total system operations, task assignments, leave actions, and announcements generated across your scope during this period.
                  </p>
                  <div className="pt-2 text-xs text-muted-foreground flex items-center justify-between">
                    <span>Date Range:</span>
                    <span className="font-semibold text-foreground">
                      {overviewData?.dateRange?.from} &rarr; {overviewData?.dateRange?.to}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Attendance Analytics */}
          {activeTab === 'attendance' && (
            <AttendanceAnalyticsSection data={attendanceData} loading={loading} />
          )}

          {/* Tab 3: Leave Analytics */}
          {activeTab === 'leave' && (
            <LeaveAnalyticsSection data={leaveData} loading={loading} />
          )}

          {/* Tab 4: Task Analytics */}
          {activeTab === 'tasks' && (
            <TaskAnalyticsSection data={taskData} loading={loading} />
          )}

          {/* Tab 5: Department Analytics (Managers / Admins) */}
          {activeTab === 'departments' && isManagerOrAdmin && (
            <DepartmentAnalyticsSection data={departmentData} loading={loading} />
          )}

          {/* Tab 6: Workforce Analytics (Managers / Admins) */}
          {activeTab === 'employees' && isManagerOrAdmin && (
            <EmployeeAnalyticsSection data={employeeData} loading={loading} />
          )}
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
