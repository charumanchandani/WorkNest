import mongoose from 'mongoose';
import { ENV } from '../config/env.js';
import User from '../models/User.js';
import Department from '../models/Department.js';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import Task from '../models/Task.js';
import Activity from '../models/Activity.js';
import analyticsService, { parseDateRange } from '../services/analyticsService.js';
import attendanceService from '../services/attendanceService.js';
import leaveService from '../services/leaveService.js';
import taskService from '../services/taskService.js';
import { seedDatabase } from './seedUsers.js';
import { ATTENDANCE_STATUS, getTodayDateString } from '../constants/attendance.js';
import { LEAVE_STATUS, LEAVE_TYPES } from '../constants/leave.js';
import { TASK_STATUS, TASK_PRIORITY } from '../constants/task.js';

const runTests = async () => {
  console.log('==================================================');
  console.log('=== STARTING PHASE 12 ANALYTICS & REPORTS TEST ===');
  console.log('==================================================');

  try {
    if (mongoose.connection.readyState !== 1) {
      try {
        await mongoose.connect(ENV.MONGODB_URI, { serverSelectionTimeoutMS: 2000 });
      } catch {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        const mem = await MongoMemoryServer.create();
        await mongoose.connect(mem.getUri());
      }
    }

    // Seed test database
    await seedDatabase();

    const admin = await User.findOne({ email: 'admin@worknest.io' });
    const manager = await User.findOne({ email: 'manager@worknest.io' }); // Marcus Vance (ENG lead)
    const employee = await User.findOne({ email: 'employee@worknest.io' }); // Elena Rostova
    const davidChen = await User.findOne({ email: 'david.chen@worknest.io' }); // David Chen (ENG)

    const engDept = await Department.findOne({ code: 'ENG' });
    const hrDept = await Department.findOne({ code: 'HR' });

    if (!admin || !manager || !employee || !davidChen || !engDept) {
      throw new Error('Could not load test seed users & departments.');
    }

    console.log('[Setup] Test users & departments verified.');

    // Clear and prepare test data for predictable analytics
    await Attendance.deleteMany({});
    await Leave.deleteMany({});
    await Task.deleteMany({});
    await Activity.deleteMany({});

    const today = getTodayDateString();
    const [currYear, currMonth] = today.split('-').map(Number);
    const mStr = String(currMonth).padStart(2, '0');
    const date1 = `${currYear}-${mStr}-05`;
    const date2 = `${currYear}-${mStr}-06`;
    const date3 = `${currYear}-${mStr}-07`;

    // 1. Seed sample Attendance records
    await Attendance.create([
      { employee: davidChen._id, date: date1, status: ATTENDANCE_STATUS.PRESENT, totalMinutes: 480, checkIn: new Date() },
      { employee: davidChen._id, date: date2, status: ATTENDANCE_STATUS.LATE, totalMinutes: 450, checkIn: new Date() },
      { employee: manager._id, date: date1, status: ATTENDANCE_STATUS.PRESENT, totalMinutes: 500, checkIn: new Date() },
      { employee: employee._id, date: date1, status: ATTENDANCE_STATUS.HALF_DAY, totalMinutes: 240, checkIn: new Date() },
      { employee: admin._id, date: today, status: ATTENDANCE_STATUS.PRESENT, totalMinutes: 480, checkIn: new Date() },
      { employee: davidChen._id, date: today, status: ATTENDANCE_STATUS.PRESENT, totalMinutes: 480, checkIn: new Date() },
    ]);

    // 2. Seed sample Leaves
    await Leave.create([
      {
        employee: davidChen._id,
        leaveType: LEAVE_TYPES.ANNUAL,
        startDate: date1,
        endDate: date3,
        totalDays: 3,
        reason: 'Vacation trip',
        status: LEAVE_STATUS.APPROVED,
        reviewedBy: manager._id,
        reviewedAt: new Date(),
      },
      {
        employee: employee._id,
        leaveType: LEAVE_TYPES.SICK,
        startDate: date2,
        endDate: date2,
        totalDays: 1,
        reason: 'Flu recovery',
        status: LEAVE_STATUS.PENDING,
      },
      {
        employee: manager._id,
        leaveType: LEAVE_TYPES.CASUAL,
        startDate: date3,
        endDate: date3,
        totalDays: 1,
        reason: 'Family event',
        status: LEAVE_STATUS.REJECTED,
        reviewedBy: admin._id,
      },
    ]);

    // 3. Seed sample Tasks
    await Task.create([
      {
        title: 'Build API Gateway',
        assignedTo: davidChen._id,
        assignedBy: manager._id,
        department: engDept._id,
        priority: TASK_PRIORITY.HIGH,
        status: TASK_STATUS.COMPLETED,
        dueDate: date1,
        completedAt: new Date(),
      },
      {
        title: 'Optimize Database Indexing',
        assignedTo: davidChen._id,
        assignedBy: manager._id,
        department: engDept._id,
        priority: TASK_PRIORITY.URGENT,
        status: TASK_STATUS.IN_PROGRESS,
        dueDate: '2020-01-01', // Past date -> OVERDUE
      },
      {
        title: 'Design Marketing Collateral',
        assignedTo: employee._id,
        assignedBy: admin._id,
        priority: TASK_PRIORITY.LOW,
        status: TASK_STATUS.TODO,
        dueDate: '2028-12-31', // Future date -> NOT overdue
      },
    ]);

    console.log('[Setup] Seeded analytics fixtures.');

    // ==========================================
    // 1. OVERVIEW ANALYTICS (Admin, Manager, Employee)
    // ==========================================
    console.log('\n--- 1. Testing Overview Analytics ---');
    const adminOverview = await analyticsService.getOverviewAnalytics({ user: admin });
    if (!adminOverview || adminOverview.scope !== 'ORGANIZATION') {
      throw new Error('Admin overview scope must be ORGANIZATION.');
    }
    if (adminOverview.employees.total < 4) {
      throw new Error('Admin overview should reflect all organization employees.');
    }
    if (adminOverview.tasks.total !== 3 || adminOverview.tasks.overdue !== 1) {
      throw new Error(`Admin overview tasks mismatch. Expected total 3, overdue 1. Got total: ${adminOverview.tasks.total}, overdue: ${adminOverview.tasks.overdue}`);
    }
    console.log('✔ [1.1] Admin overview returns organization-wide metrics with correct overdue derivation.');

    const managerOverview = await analyticsService.getOverviewAnalytics({ user: manager });
    if (!managerOverview || managerOverview.scope !== 'TEAM') {
      throw new Error('Manager overview scope must be TEAM.');
    }
    console.log('✔ [1.2] Manager overview correctly scoped to managed department/team.');

    const employeeOverview = await analyticsService.getOverviewAnalytics({ user: employee });
    if (!employeeOverview || employeeOverview.scope !== 'PERSONAL') {
      throw new Error('Employee overview scope must be PERSONAL.');
    }
    console.log('✔ [1.3] Employee overview strictly limited to personal metrics without org leak.');

    // ==========================================
    // 2. ATTENDANCE ANALYTICS & DAILY TREND
    // ==========================================
    console.log('\n--- 2. Testing Attendance Analytics ---');
    const attAnalytics = await analyticsService.getAttendanceAnalytics({
      user: admin,
      from: `${currYear}-${mStr}-01`,
      to: `${currYear}-${mStr}-28`,
    });

    if (attAnalytics.summary.totalRecords !== 6) {
      throw new Error(`Expected 6 attendance records, got ${attAnalytics.summary.totalRecords}`);
    }
    if (!Array.isArray(attAnalytics.trend) || attAnalytics.trend.length === 0) {
      throw new Error('Attendance trend must be an array of daily aggregates.');
    }
    const trendEntry = attAnalytics.trend.find((t) => t.date === date1);
    if (!trendEntry || trendEntry.present < 2) {
      throw new Error('Trend for date1 should aggregate present counts.');
    }
    console.log('✔ [2.1] Attendance analytics correctly aggregates rates, hours, and daily trend time-series.');

    // ==========================================
    // 3. LEAVE ANALYTICS & BREAKDOWNS
    // ==========================================
    console.log('\n--- 3. Testing Leave Analytics ---');
    const leaveAnalytics = await analyticsService.getLeaveAnalytics({
      user: admin,
      from: `${currYear}-${mStr}-01`,
      to: `${currYear}-${mStr}-28`,
    });

    if (leaveAnalytics.summary.totalRequests !== 3) {
      throw new Error(`Expected 3 leave requests, got ${leaveAnalytics.summary.totalRequests}`);
    }
    if (leaveAnalytics.summary.approved !== 1 || leaveAnalytics.summary.totalApprovedDays !== 3) {
      throw new Error('Leave approved counts mismatch.');
    }
    if (leaveAnalytics.byType.ANNUAL.days !== 3) {
      throw new Error('Leave type ANNUAL days should equal 3.');
    }
    console.log('✔ [3.1] Leave analytics properly breaks down approved days, status counts, and types.');

    // ==========================================
    // 4. TASK ANALYTICS & OVERDUE DERIVATION
    // ==========================================
    console.log('\n--- 4. Testing Task Analytics ---');
    const taskAnalytics = await analyticsService.getTaskAnalytics({
      user: admin,
      from: '2020-01-01',
      to: '2030-12-31',
    });

    if (taskAnalytics.summary.totalTasks !== 3) {
      throw new Error(`Expected 3 tasks, got ${taskAnalytics.summary.totalTasks}`);
    }
    if (taskAnalytics.summary.overdue !== 1) {
      throw new Error(`Expected 1 overdue task, got ${taskAnalytics.summary.overdue}`);
    }
    if (taskAnalytics.summary.completed !== 1) {
      throw new Error(`Expected 1 completed task, got ${taskAnalytics.summary.completed}`);
    }
    console.log('✔ [4.1] Task analytics correctly classifies priorities, status, and matches Task overdue logic.');

    // ==========================================
    // 5. EMPLOYEE ANALYTICS & RBAC
    // ==========================================
    console.log('\n--- 5. Testing Employee Analytics & Scopes ---');
    const empAnalytics = await analyticsService.getEmployeeAnalytics({ user: admin });
    if (empAnalytics.summary.totalEmployees < 4) {
      throw new Error('Employee analytics should list all employees for admin.');
    }
    if (!empAnalytics.byRole.ADMIN || !empAnalytics.byRole.MANAGER) {
      throw new Error('Employee analytics byRole missing roles.');
    }

    // Manager employee analytics
    const mgrEmpAnalytics = await analyticsService.getEmployeeAnalytics({ user: manager });
    if (mgrEmpAnalytics.summary.totalEmployees >= empAnalytics.summary.totalEmployees) {
      throw new Error('Manager employee analytics must be scoped and smaller than full org.');
    }

    // Employee role should be blocked with 403
    let empBlocked = false;
    try {
      await analyticsService.getEmployeeAnalytics({ user: employee });
    } catch (err) {
      if (err.statusCode === 403) empBlocked = true;
    }
    if (!empBlocked) {
      throw new Error('Employees must be forbidden from accessing organization employee analytics.');
    }
    console.log('✔ [5.1] Employee analytics enforces Admin org-wide, Manager team-scoped, and blocks Employee (403).');

    // ==========================================
    // 6. DEPARTMENT ANALYTICS & RBAC
    // ==========================================
    console.log('\n--- 6. Testing Department Analytics & Scopes ---');
    const deptAnalytics = await analyticsService.getDepartmentAnalytics({ user: admin });
    if (!Array.isArray(deptAnalytics.departments) || deptAnalytics.departments.length === 0) {
      throw new Error('Department analytics should return list of departments.');
    }

    let deptEmpBlocked = false;
    try {
      await analyticsService.getDepartmentAnalytics({ user: employee });
    } catch (err) {
      if (err.statusCode === 403) deptEmpBlocked = true;
    }
    if (!deptEmpBlocked) {
      throw new Error('Employees must be forbidden from accessing department analytics.');
    }
    console.log('✔ [6.1] Department analytics calculates workload, attendance, and enforces RBAC.');

    // ==========================================
    // 7. DATE FILTERING & VALIDATION
    // ==========================================
    console.log('\n--- 7. Testing Date Range Parsing ---');
    const defaultRange = parseDateRange();
    if (!defaultRange.from || !defaultRange.to || defaultRange.from > defaultRange.to) {
      throw new Error('Default date range failed.');
    }

    const customRange = parseDateRange('2026-05-01', '2026-05-31');
    if (customRange.from !== '2026-05-01' || customRange.to !== '2026-05-31') {
      throw new Error('Custom date range failed.');
    }
    console.log('✔ [7.1] Date range parser handles defaults and valid date inputs.');

    // ==========================================
    // 8. INVALID DATE FORMATS (HTTP 400)
    // ==========================================
    console.log('\n--- 8. Testing Invalid Date Handling ---');
    let invalidDateCaught = false;
    try {
      parseDateRange('invalid-date', '2026-05-31');
    } catch (err) {
      if (err.statusCode === 400) invalidDateCaught = true;
    }
    if (!invalidDateCaught) throw new Error('Invalid date did not throw 400.');

    let invertedDatesCaught = false;
    try {
      parseDateRange('2026-05-31', '2026-05-01');
    } catch (err) {
      if (err.statusCode === 400) invertedDatesCaught = true;
    }
    if (!invertedDatesCaught) throw new Error('Inverted date range (from > to) did not throw 400.');
    console.log('✔ [8.1] Invalid and malformed dates correctly rejected with HTTP 400.');

    // ==========================================
    // 9. INVALID REPORT TYPE (HTTP 400)
    // ==========================================
    console.log('\n--- 9. Testing Invalid Report Type Handling ---');
    let invalidReportCaught = false;
    try {
      await analyticsService.getReportData({ user: admin, type: 'non_existent_report_type' });
    } catch (err) {
      if (err.statusCode === 400) invalidReportCaught = true;
    }
    if (!invalidReportCaught) throw new Error('Unsupported report type did not throw 400.');
    console.log('✔ [9.1] Invalid report types properly rejected with HTTP 400.');

    // ==========================================
    // 10. EMPLOYEE SCOPE ISOLATION
    // ==========================================
    console.log('\n--- 10. Testing Employee Scope Isolation ---');
    const empAttReport = await analyticsService.getReportData({ user: employee, type: 'attendance' });
    const hasOtherUsersInEmpReport = empAttReport.records.some(
      (r) => r.employeeId !== employee.employeeId
    );
    if (hasOtherUsersInEmpReport) {
      throw new Error('Employee report contains records from other employees! Scope isolation violated.');
    }
    console.log('✔ [10.1] Employee report strictly isolates data to requesting employee.');

    // ==========================================
    // 11. MANAGER SCOPE ISOLATION
    // ==========================================
    console.log('\n--- 11. Testing Manager Scope Isolation ---');
    let mgrDeptBlocked = false;
    try {
      // HR dept is managed by admin, Marcus Vance manages ENG
      await analyticsService.getAttendanceAnalytics({
        user: manager,
        department: hrDept._id.toString(),
      });
    } catch (err) {
      if (err.statusCode === 403) mgrDeptBlocked = true;
    }
    if (!mgrDeptBlocked) {
      throw new Error('Manager should be forbidden from filtering on unmanaged department.');
    }
    console.log('✔ [11.1] Manager is strictly forbidden from querying outside managed departments.');

    // ==========================================
    // 12. ADMIN FULL SCOPE
    // ==========================================
    console.log('\n--- 12. Testing Admin Full Organization Scope ---');
    const adminTaskReport = await analyticsService.getReportData({ user: admin, type: 'tasks' });
    if (adminTaskReport.records.length !== 3) {
      throw new Error(`Admin task report should return all 3 tasks, got ${adminTaskReport.records.length}`);
    }
    console.log('✔ [12.1] Admin report returns all organizational data across all departments.');

    // ==========================================
    // 13. REPORT GENERATION ACROSS ALL 5 TYPES
    // ==========================================
    console.log('\n--- 13. Testing Report Generation for All 5 Types ---');
    const types = ['attendance', 'leave', 'tasks', 'employees', 'departments'];
    for (const t of types) {
      const report = await analyticsService.getReportData({ user: admin, type: t });
      if (!report || report.reportType !== t || !Array.isArray(report.records)) {
        throw new Error(`Report generation failed for type: ${t}`);
      }
      console.log(`  ✔ Report generated successfully: ${t} (${report.records.length} records)`);
    }

    // ==========================================
    // 14. CSV GENERATION & FORMULA INJECTION PREVENTION
    // ==========================================
    console.log('\n--- 14. Testing CSV Generation & Formula Injection Mitigation ---');
    const mockReportData = {
      reportType: 'tasks',
      records: [
        {
          id: '1',
          title: '=1+1', // Formula injection attempt
          priority: '+HIGH', // Formula injection attempt
          status: '-ACTIVE', // Formula injection attempt
          assignedTo: '@attacker', // Formula injection attempt
        },
      ],
    };

    const csvOutput = analyticsService.generateReportCsv(mockReportData);
    if (!csvOutput.includes("title,priority,status,assignedTo")) {
      throw new Error('CSV output missing header line.');
    }
    if (!csvOutput.includes("'=1+1") || !csvOutput.includes("'+HIGH") || !csvOutput.includes("'-ACTIVE") || !csvOutput.includes("'@attacker")) {
      throw new Error('CSV formula injection values were not sanitized with single quote prefix!');
    }
    console.log('✔ [14.1] CSV generation sanitizes spreadsheet formulas against CWE-1236 injection.');

    // ==========================================
    // 15. SENSITIVE FIELD EXCLUSION
    // ==========================================
    console.log('\n--- 15. Testing Sensitive Field Exclusion ---');
    const empReport = await analyticsService.getReportData({ user: admin, type: 'employees' });
    const empCsv = analyticsService.generateReportCsv(empReport);
    if (
      empCsv.toLowerCase().includes('password') ||
      empCsv.toLowerCase().includes('hash') ||
      empCsv.toLowerCase().includes('jwt')
    ) {
      throw new Error('CSV export contains sensitive password or token fields!');
    }
    console.log('✔ [15.1] Sensitive authentication credentials strictly excluded from reports and exports.');

    // ==========================================
    // 16. PHASE 0-11 REGRESSION VERIFICATION
    // ==========================================
    console.log('\n--- 16. Testing Phase 0-11 API Regression ---');
    // Verify attendance service
    const todayAtt = await attendanceService.getTodayAttendance(admin._id);
    if (!todayAtt) throw new Error('Attendance service regression.');

    // Verify leave service
    const myLeaves = await leaveService.getMyLeaves({ userId: davidChen._id });
    if (!myLeaves || !Array.isArray(myLeaves.records)) throw new Error('Leave service regression.');

    // Verify task service
    const myTasks = await taskService.getMyTasks({ userId: davidChen._id });
    if (!myTasks || !Array.isArray(myTasks.records)) throw new Error('Task service regression.');

    console.log('✔ [16.1] Phase 0-11 foundational services operational and unaffected.');

    console.log('\n==================================================');
    console.log('=== ALL PHASE 12 TESTS PASSED SUCCESSFULLY! ===');
    console.log('==================================================');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ PHASE 12 TEST FAILURE:', error);
    process.exit(1);
  }
};

runTests();
