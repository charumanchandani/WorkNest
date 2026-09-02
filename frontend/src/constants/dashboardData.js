/**
 * WorkNest Dashboard Mock Presentation Data
 * Used strictly for Phase 4 UI visualization before backend modules are connected.
 */

export const dashboardMockData = {
  // Key KPI summaries
  metrics: {
    todayAttendance: {
      status: 'Present',
      checkInTime: '09:18 AM',
      location: 'HQ Office - Building A',
      onTime: true,
    },
    leaveBalance: {
      availableDays: 12,
      totalAllowance: 18,
      usedDays: 6,
      pendingRequests: 1,
    },
    tasks: {
      totalOpen: 5,
      dueThisWeek: 2,
      completedThisMonth: 14,
    },
    notifications: {
      unreadCount: 3,
      totalCount: 8,
    },
  },

  // Weekly attendance history
  weeklyAttendance: [
    { day: 'Mon', date: 'Aug 31', status: 'Present', checkIn: '09:02 AM', checkOut: '05:30 PM', hours: '8.5h' },
    { day: 'Tue', date: 'Sep 01', status: 'Present', checkIn: '08:58 AM', checkOut: '05:15 PM', hours: '8.2h' },
    { day: 'Wed', date: 'Sep 02', status: 'Present', checkIn: '09:18 AM', checkOut: 'In Progress', hours: 'Live' },
    { day: 'Thu', date: 'Sep 03', status: 'Upcoming', checkIn: '—', checkOut: '—', hours: '—' },
    { day: 'Fri', date: 'Sep 04', status: 'Upcoming', checkIn: '—', checkOut: '—', hours: '—' },
  ],

  // Leave breakdown
  leaveBreakdown: [
    { type: 'Annual Paid Leave', remaining: 12, total: 18, color: 'teal' },
    { type: 'Casual / Personal', remaining: 4, total: 6, color: 'sky' },
    { type: 'Sick Leave', remaining: 7, total: 8, color: 'emerald' },
  ],

  // Priority tasks
  tasks: [
    {
      id: 'task-1',
      title: 'Submit Q3 quarterly self-assessment report',
      category: 'Performance',
      priority: 'High',
      status: 'In Progress',
      dueDate: 'Today at 05:00 PM',
      completed: false,
    },
    {
      id: 'task-2',
      title: 'Review updated 2026 Workplace Hybrid Guidelines',
      category: 'Compliance',
      priority: 'Normal',
      status: 'To Do',
      dueDate: 'Tomorrow',
      completed: false,
    },
    {
      id: 'task-3',
      title: 'Verify emergency contact details in HR records',
      category: 'Profile',
      priority: 'Low',
      status: 'To Do',
      dueDate: 'Sep 08',
      completed: false,
    },
    {
      id: 'task-4',
      title: 'Complete cybersecurity refresher training module',
      category: 'Training',
      priority: 'High',
      status: 'Completed',
      dueDate: 'Yesterday',
      completed: true,
    },
  ],

  // Recent notifications & announcements
  notifications: [
    {
      id: 'notif-1',
      title: 'Leave Request Received',
      description: 'Your leave request for Sep 14 has been forwarded to Marcus Vance for approval.',
      time: '25 min ago',
      unread: true,
      type: 'leave',
    },
    {
      id: 'notif-2',
      title: 'Company Holiday Broadcast',
      description: 'Office will remain closed on Friday, Sep 18 for Organizational Development Day.',
      time: '2 hours ago',
      unread: true,
      type: 'announcement',
    },
    {
      id: 'notif-3',
      title: 'Task Assignment',
      description: 'You were assigned to "Submit Q3 quarterly self-assessment report".',
      time: '5 hours ago',
      unread: true,
      type: 'task',
    },
    {
      id: 'notif-4',
      title: 'August Payroll Processed',
      description: 'Salary payslip for August 2026 is now available in your documents vault.',
      time: '2 days ago',
      unread: false,
      type: 'document',
    },
  ],

  // Recent operational activity timeline
  recentActivity: [
    { id: 'act-1', event: 'Checked in at HQ Office', timestamp: 'Today at 09:18 AM', icon: 'clock' },
    { id: 'act-2', event: 'Submitted 1-day leave request for Sep 14', timestamp: 'Today at 08:45 AM', icon: 'calendar' },
    { id: 'act-3', event: 'Completed "Cybersecurity refresher training"', timestamp: 'Yesterday at 04:30 PM', icon: 'check' },
    { id: 'act-4', event: 'Downloaded August Payslip document', timestamp: 'Aug 31 at 11:20 AM', icon: 'file' },
  ],
};

export default dashboardMockData;
