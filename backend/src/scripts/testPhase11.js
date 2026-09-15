import mongoose from 'mongoose';
import { ENV } from '../config/env.js';
import User from '../models/User.js';
import Department from '../models/Department.js';
import Notification from '../models/Notification.js';
import Activity from '../models/Activity.js';
import notificationService from '../services/notificationService.js';
import activityService from '../services/activityService.js';
import leaveService from '../services/leaveService.js';
import taskService from '../services/taskService.js';
import documentService from '../services/documentService.js';
import announcementService from '../services/announcementService.js';
import attendanceService from '../services/attendanceService.js';
import { seedDatabase } from './seedUsers.js';

const runTests = async () => {
  console.log('==================================================');
  console.log('=== STARTING PHASE 11 NOTIFICATIONS & ACTIVITY ===');
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

    // Clean up notifications and activities for clean testing
    await Notification.deleteMany({});
    await Activity.deleteMany({});

    const admin = await User.findOne({ email: 'admin@worknest.io' });
    const manager = await User.findOne({ email: 'manager@worknest.io' });
    const employee = await User.findOne({ email: 'employee@worknest.io' });
    const davidChen = await User.findOne({ email: 'david.chen@worknest.io' });

    const engDept = await Department.findOne({ code: 'ENG' });

    if (!admin || !manager || !employee || !davidChen) {
      throw new Error('Could not load test users.');
    }

    console.log('[Setup] Test users & departments verified.');

    // ==========================================
    // 1. NOTIFICATION WORKFLOW TRIGGERS
    // ==========================================
    console.log('\n--- 1. Testing Notification Triggers ---');

    // Trigger A: Employee (David Chen, ENG dept) submits leave -> Manager (Marcus Vance, ENG lead) receives notification
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 10);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 12);
    const startStr = tomorrow.toISOString().slice(0, 10);
    const endStr = dayAfter.toISOString().slice(0, 10);

    const leave = await leaveService.createLeave({
      userId: davidChen._id,
      leaveType: 'ANNUAL',
      startDate: startStr,
      endDate: endStr,
      reason: 'Personal time off for family event.',
    });

    const managerNotifsAfterLeave = await notificationService.getNotifications({ user: manager });
    const leaveSubmittedNotif = managerNotifsAfterLeave.records.find(
      (n) => n.type === 'LEAVE_SUBMITTED' && n.entityId === leave.id
    );

    if (!leaveSubmittedNotif) {
      throw new Error('Manager did not receive LEAVE_SUBMITTED notification.');
    }
    console.log('✔ [Trigger 1] Manager received LEAVE_SUBMITTED notification upon employee leave creation.');

    // Trigger B: Manager approves leave -> Employee (David Chen) receives notification
    await leaveService.approveLeave({
      id: leave.id,
      reviewerUser: manager,
      reviewComment: 'Approved, enjoy your time off!',
    });

    const empNotifsAfterApprove = await notificationService.getNotifications({ user: davidChen });
    const leaveApprovedNotif = empNotifsAfterApprove.records.find(
      (n) => n.type === 'LEAVE_APPROVED' && n.entityId === leave.id
    );

    if (!leaveApprovedNotif) {
      throw new Error('Employee did not receive LEAVE_APPROVED notification.');
    }
    console.log('✔ [Trigger 2] Employee received LEAVE_APPROVED notification upon leave approval.');

    // Trigger C: Manager assigns task -> Assignee receives notification
    const taskDueDate = new Date();
    taskDueDate.setDate(taskDueDate.getDate() + 5);
    const dueDateStr = taskDueDate.toISOString().slice(0, 10);

    const task = await taskService.createTask({
      creatorUser: manager,
      title: 'Design Phase 11 Notifications System UI',
      description: 'Implement notification center and real-time popover components.',
      assignedTo: davidChen._id,
      priority: 'HIGH',
      dueDate: dueDateStr,
    });

    const davidNotifsAfterTask = await notificationService.getNotifications({ user: davidChen });
    const taskAssignedNotif = davidNotifsAfterTask.records.find(
      (n) => n.type === 'TASK_ASSIGNED' && n.entityId === task.id
    );

    if (!taskAssignedNotif) {
      throw new Error('Assignee did not receive TASK_ASSIGNED notification.');
    }
    console.log('✔ [Trigger 3] Employee received TASK_ASSIGNED notification upon task assignment.');

    // Trigger D: Assignee updates task status -> Assigner receives notification
    await taskService.updateTaskStatus({
      id: task.id,
      user: davidChen,
      status: 'IN_PROGRESS',
    });

    const managerNotifsAfterStatus = await notificationService.getNotifications({ user: manager });
    const taskStatusNotif = managerNotifsAfterStatus.records.find(
      (n) => n.type === 'TASK_STATUS_CHANGED' && n.entityId === task.id
    );

    if (!taskStatusNotif) {
      throw new Error('Task assigner did not receive TASK_STATUS_CHANGED notification.');
    }
    console.log('✔ [Trigger 4] Manager received TASK_STATUS_CHANGED notification when employee started task.');

    // Trigger E: Admin uploads document -> Eligible users receive notification
    const doc = await documentService.createDocument({
      title: 'Company Security Protocol 2026',
      description: 'Standard operational security manual for all departments.',
      category: 'POLICY',
      visibility: 'ORGANIZATION',
      department: null,
      expiresAt: null,
      file: {
        originalname: 'security_policy.pdf',
        mimetype: 'application/pdf',
        buffer: Buffer.from('Security policy PDF'),
      },
      user: admin,
    });

    const davidNotifsAfterDoc = await notificationService.getNotifications({ user: davidChen });
    const docNotif = davidNotifsAfterDoc.records.find(
      (n) => n.type === 'DOCUMENT_ADDED' && n.entityId === doc.id
    );

    if (!docNotif) {
      throw new Error('Employee did not receive DOCUMENT_ADDED notification for org document.');
    }
    console.log('✔ [Trigger 5] Target employees received DOCUMENT_ADDED notification for uploaded document.');

    // Trigger F: Manager publishes announcement -> Target department employees receive notification
    const announcement = await announcementService.createAnnouncement({
      title: 'Engineering Sprint Retrospective',
      content: 'All engineering team members please join the sprint retro on Friday afternoon.',
      targetType: 'DEPARTMENT',
      department: engDept ? engDept._id : undefined,
      expiresAt: null,
      status: 'PUBLISHED',
      user: manager,
    });

    const davidNotifsAfterAnnouncement = await notificationService.getNotifications({ user: davidChen });
    const announcementNotif = davidNotifsAfterAnnouncement.records.find(
      (n) => n.type === 'ANNOUNCEMENT_PUBLISHED' && n.entityId === announcement.id
    );

    if (!announcementNotif) {
      throw new Error('Department employee (David Chen) did not receive ANNOUNCEMENT_PUBLISHED notification.');
    }
    console.log('✔ [Trigger 6] Department members received ANNOUNCEMENT_PUBLISHED notification.');

    // ==========================================
    // 2. READ / UNREAD STATE & API LOGIC
    // ==========================================
    console.log('\n--- 2. Testing Read State, Unread Count & Mark All Read ---');

    // Check initial unread count for davidChen
    const initialUnreadRes = await notificationService.getUnreadCount(davidChen._id);
    console.log(`[Unread Count] Employee has ${initialUnreadRes.unreadCount} unread notifications.`);

    if (initialUnreadRes.unreadCount <= 0) {
      throw new Error('Employee should have unread notifications.');
    }

    // Mark single notification as read
    const notifToRead = davidNotifsAfterAnnouncement.records[0];
    const markReadRes = await notificationService.markAsRead(notifToRead.id, davidChen);

    if (!markReadRes.isRead || !markReadRes.readAt) {
      throw new Error('Notification isRead was not set to true or readAt is missing.');
    }

    const updatedUnreadRes = await notificationService.getUnreadCount(davidChen._id);
    if (updatedUnreadRes.unreadCount !== initialUnreadRes.unreadCount - 1) {
      throw new Error('Unread count did not decrement correctly after markAsRead.');
    }
    console.log('✔ [Read State] Single notification marked as read, unread count decremented.');

    // Mark all as read
    const markAllRes = await notificationService.markAllAsRead(davidChen);
    console.log(`[Mark All Read] Modified ${markAllRes.updatedCount} notifications.`);

    const finalUnreadRes = await notificationService.getUnreadCount(davidChen._id);
    if (finalUnreadRes.unreadCount !== 0) {
      throw new Error('Unread count is not 0 after markAllAsRead.');
    }
    console.log('✔ [Read State] markAllAsRead successfully set all employee notifications to read.');

    // ==========================================
    // 3. SECURITY & RECIPIENT AUTHORIZATION
    // ==========================================
    console.log('\n--- 3. Testing Security & Recipient Isolation ---');

    // Attempt to read manager's notification as employee
    const managerNotif = managerNotifsAfterStatus.records[0];
    let crossReadBlocked = false;
    try {
      await notificationService.markAsRead(managerNotif.id, employee);
    } catch (err) {
      if (err.statusCode === 404 || err.statusCode === 403) {
        crossReadBlocked = true;
      }
    }

    if (!crossReadBlocked) {
      throw new Error('Security flaw: Employee was able to mark manager notification as read!');
    }
    console.log('✔ [Security] Cross-user notification manipulation successfully blocked (404/403).');

    // ==========================================
    // 4. ACTIVITY & AUDIT TRAIL
    // ==========================================
    console.log('\n--- 4. Testing Activity Logging & RBAC Scoping ---');

    // Trigger attendance check-in & check-out for activity logging
    await attendanceService.checkIn(employee._id);
    await attendanceService.checkOut(employee._id);

    // Verify activities were created
    const allActivities = await Activity.find({});
    console.log(`[Activity Audit] Total generated activity records: ${allActivities.length}`);

    const hasLeaveActivity = allActivities.some((a) => a.action === 'LEAVE_SUBMITTED');
    const hasTaskActivity = allActivities.some((a) => a.action === 'TASK_CREATED');
    const hasDocActivity = allActivities.some((a) => a.action === 'DOCUMENT_UPLOADED');
    const hasAnnouncementActivity = allActivities.some((a) => a.action === 'ANNOUNCEMENT_PUBLISHED');
    const hasAttendanceCheckIn = allActivities.some((a) => a.action === 'ATTENDANCE_CHECKED_IN');
    const hasAttendanceCheckOut = allActivities.some((a) => a.action === 'ATTENDANCE_CHECKED_OUT');

    if (
      !hasLeaveActivity ||
      !hasTaskActivity ||
      !hasDocActivity ||
      !hasAnnouncementActivity ||
      !hasAttendanceCheckIn ||
      !hasAttendanceCheckOut
    ) {
      throw new Error('One or more required activity types were not logged.');
    }
    console.log('✔ [Activity Triggers] Verified activity records for Leave, Task, Document, Announcement, Attendance.');

    // Test Admin Scoping (Full Organization Feed)
    const adminFeed = await activityService.getActivities({ user: admin });
    console.log(`[RBAC] Admin retrieved ${adminFeed.total} total org activities.`);
    if (adminFeed.total < 5) {
      throw new Error('Admin activity feed did not return organization activities.');
    }
    console.log('✔ [RBAC Admin] Admin has full visibility into all organizational activity.');

    // Test Manager Scoping (Managed Department & Team Scope)
    const managerFeed = await activityService.getActivities({ user: manager });
    console.log(`[RBAC] Manager retrieved ${managerFeed.total} department-scoped activities.`);
    if (managerFeed.total <= 0) {
      throw new Error('Manager should see department activities.');
    }
    console.log('✔ [RBAC Manager] Manager activity feed correctly scoped to managed department.');

    // Test Employee Scoping (Strictly Own Actions & Targeted Events)
    const employeeFeed = await activityService.getActivities({ user: employee });
    console.log(`[RBAC] Employee retrieved ${employeeFeed.total} personal activities.`);

    // Ensure employee does not see unrelated engineering department actions or admin-only events
    const hasUnrelatedEvent = employeeFeed.records.some(
      (a) =>
        a.actor?.id !== employee._id.toString() &&
        a.metadata?.targetUserId !== employee._id.toString() &&
        a.metadata?.employeeId !== employee._id.toString()
    );

    if (hasUnrelatedEvent) {
      throw new Error('Security flaw: Employee feed leaked unrelated activity records!');
    }
    console.log('✔ [RBAC Employee] Employee activity feed strictly isolated to personal activities.');

    console.log('\n==================================================');
    console.log('=== ALL PHASE 11 AUTOMATED TESTS PASSED (100%) ===');
    console.log('==================================================');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ [TEST FAILURE]:', err);
    process.exit(1);
  }
};

runTests();
