import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../hooks';
import { Badge } from '../components/ui';
import {
  DashboardSummaryCards,
  QuickActions,
  AttendanceWidget,
  LeaveWidget,
  TasksWidget,
  ActivityFeed,
} from '../components/app';
import { dashboardMockData } from '../constants/dashboardData';
import attendanceService from '../services/attendanceService';
import leaveService from '../services/leaveService';
import taskService from '../services/taskService';

export const EmployeeDashboard = () => {
  const { user } = useAuth();
  const outletContext = useOutletContext();
  const onShowModuleNotice = outletContext?.onShowModuleNotice;

  // Real attendance state
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [attendanceError, setAttendanceError] = useState('');

  // Real leave balance state
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [leaveError, setLeaveError] = useState('');

  // Real tasks state
  const [personalTasks, setPersonalTasks] = useState([]);
  const [tasksSummary, setTasksSummary] = useState(null);
  const [tasksError, setTasksError] = useState('');

  useEffect(() => {
    const fetchTodayAttendance = async () => {
      try {
        setAttendanceError('');
        const res = await attendanceService.getTodayAttendance();
        if (res?.data?.attendance) {
          setTodayAttendance(res.data.attendance);
        }
      } catch (err) {
        // Non-blocking error handling for dashboard
        setAttendanceError(err.formattedMessage || 'Failed to load today’s attendance.');
      }
    };

    const fetchLeaveBalance = async () => {
      try {
        setLeaveError('');
        const res = await leaveService.getMyBalance();
        if (res?.data?.balance) {
          setLeaveBalance(res.data.balance);
        }
      } catch (err) {
        setLeaveError(err.formattedMessage || 'Failed to load leave balance.');
      }
    };

    const fetchMyTasks = async () => {
      try {
        setTasksError('');
        const res = await taskService.getMyTasks({ limit: 4 });
        if (res?.data) {
          setPersonalTasks(res.data.records || []);
          setTasksSummary(res.data.summary || null);
        }
      } catch (err) {
        setTasksError(err.formattedMessage || 'Failed to load assigned tasks.');
      }
    };

    fetchTodayAttendance();
    fetchLeaveBalance();
    fetchMyTasks();
  }, []);

  // Extract first name
  const firstName = user?.name ? user.name.split(' ')[0] : 'Colleague';

  // Determine greeting based on current local hour
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'destructive';
      case 'MANAGER':
        return 'warning';
      default:
        return 'primary';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header & Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {greeting}, {firstName}
            </h1>
            <Badge variant={getRoleBadgeVariant(user?.role)} size="md">
              {user?.role}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Here&apos;s an overview of your workday schedule, assignments, and team notices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/50 border border-teal-200/70 dark:border-teal-800/70 flex items-center gap-2 text-xs text-teal-800 dark:text-teal-300">
            <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
            <span className="font-medium">Phase 9 Live</span>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Row (4 KPI Summary Cards) */}
      <DashboardSummaryCards
        metrics={dashboardMockData.metrics}
        onQuickAction={onShowModuleNotice}
      />

      {/* 3. Quick Actions Bar */}
      <QuickActions onActionClick={onShowModuleNotice} />

      {/* 4. Core Operational Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols on lg screens): Tasks & Attendance */}
        <div className="lg:col-span-2 space-y-6">
          {/* Priority Tasks Widget (Real Data) */}
          <TasksWidget
            tasks={personalTasks}
            summary={tasksSummary}
            error={tasksError}
          />

          {/* Real Workday Attendance Widget */}
          <AttendanceWidget
            todayAttendance={todayAttendance}
            error={attendanceError}
          />
        </div>

        {/* Right Column (1 col on lg screens): Leave Balance & Activity Feed */}
        <div className="space-y-6">
          {/* Real Leave Allowance Breakdown */}
          <LeaveWidget
            balance={leaveBalance}
            error={leaveError}
          />

          {/* Recent Operational Activity Feed */}
          <ActivityFeed activities={dashboardMockData.recentActivity} />
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
