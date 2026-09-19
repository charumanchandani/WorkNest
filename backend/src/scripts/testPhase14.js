import mongoose from 'mongoose';
import { ENV } from '../config/env.js';
import User from '../models/User.js';
import Activity from '../models/Activity.js';
import profileService from '../services/profileService.js';
import notificationService from '../services/notificationService.js';
import aiService from '../services/aiService.js';
import analyticsService from '../services/analyticsService.js';
import { seedDatabase } from './seedUsers.js';
import { NOTIFICATION_TYPE } from '../constants/notification.js';

const runPhase14Tests = async () => {
  console.log('==================================================');
  console.log('=== STARTING PHASE 14 PROFILE & SETTINGS TESTS ===');
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

    await seedDatabase();

    const admin = await User.findOne({ email: 'admin@worknest.io' });
    const manager = await User.findOne({ email: 'manager@worknest.io' });
    const employee = await User.findOne({ email: 'employee@worknest.io' });

    if (!admin || !manager || !employee) {
      throw new Error('Test fixtures missing after seed.');
    }

    // --- 1. Testing GET Profile ---
    console.log('\n--- 1. Testing GET Profile ---');
    const empProfile = await profileService.getProfile(employee._id);

    if (!empProfile || empProfile.email !== 'employee@worknest.io') {
      throw new Error('getProfile did not return expected employee profile.');
    }
    if (empProfile.password || empProfile.passwordHash) {
      throw new Error('Sensitive password field exposed in profile.');
    }
    if (!empProfile.employeeId || !empProfile.role || !empProfile.notificationPreferences) {
      throw new Error('Profile missing employeeId, role, or notificationPreferences.');
    }
    console.log('✔ [1.1] getProfile successfully returns safe employee profile.');

    // --- 2. Testing Profile Update ---
    console.log('\n--- 2. Testing Profile Update ---');
    const updatedEmp = await profileService.updateProfile(employee._id, {
      firstName: 'Jane',
      lastName: 'Doe',
      phone: '+1 555-019-2834',
      location: 'New York, USA',
    });

    if (
      updatedEmp.firstName !== 'Jane' ||
      updatedEmp.lastName !== 'Doe' ||
      updatedEmp.name !== 'Jane Doe' ||
      updatedEmp.phone !== '+1 555-019-2834' ||
      updatedEmp.location !== 'New York, USA'
    ) {
      throw new Error('Profile update failed to save whitelisted fields or synchronize full name.');
    }
    console.log('✔ [2.1] Profile update successfully modified whitelisted fields and synchronized full name.');

    // --- 3. Testing Whitelist & Mass-Assignment Protection ---
    console.log('\n--- 3. Testing Whitelist & Mass-Assignment Protection ---');
    const maliciousUpdate = await profileService.updateProfile(employee._id, {
      role: 'ADMIN',
      employeeId: 'WN-HACKED',
      isActive: false,
      status: 'INACTIVE',
      department: admin.department || employee.department,
      password: 'MaliciousPassword1!',
    });

    if (maliciousUpdate.role !== 'EMPLOYEE') {
      throw new Error('CRITICAL SECURITY FLAW: User escalated role to ADMIN via profile update!');
    }
    if (maliciousUpdate.employeeId === 'WN-HACKED') {
      throw new Error('CRITICAL SECURITY FLAW: User modified employeeId via profile update!');
    }
    if (!maliciousUpdate.isActive || maliciousUpdate.status !== 'ACTIVE') {
      throw new Error('CRITICAL SECURITY FLAW: User modified account status via profile update!');
    }
    console.log('✔ [3.1] Mass-assignment protection verified: role, employeeId, and status cannot be modified.');

    // --- 4. Testing Invalid Profile ID Access ---
    console.log('\n--- 4. Testing Invalid Profile ID Access ---');
    try {
      await profileService.getProfile('invalid-id');
      throw new Error('Invalid ID should have thrown 400 error.');
    } catch (err) {
      if (err.statusCode !== 400) {
        throw new Error(`Expected 400 for invalid ID, got ${err.statusCode}`);
      }
    }
    console.log('✔ [4.1] Invalid profile ID access properly blocked with HTTP 400.');

    // --- 5, 6, 7, 8. Testing Password Change & Security Policies ---
    console.log('\n--- 5-8. Testing Password Change & Security Policies ---');

    // 6. Wrong current password
    try {
      await profileService.changePassword(employee._id, {
        currentPassword: 'WrongPassword!',
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      });
      throw new Error('Password change with wrong current password should fail.');
    } catch (err) {
      if (err.statusCode !== 400) {
        throw new Error(`Expected 400 for wrong current password, got ${err.statusCode}`);
      }
      console.log('✔ [6.1] Wrong current password properly rejected with HTTP 400.');
    }

    // 7. Weak passwords
    const weakPasswords = [
      'short1!', // < 8 chars
      'nouppercase123!', // no uppercase
      'NOLOWERCASE123!', // no lowercase
      'NoNumbersHere!', // no number
    ];
    for (const weak of weakPasswords) {
      try {
        await profileService.changePassword(employee._id, {
          currentPassword: 'Password123!',
          newPassword: weak,
          confirmPassword: weak,
        });
        throw new Error(`Weak password '${weak}' should have been rejected by policy.`);
      } catch (err) {
        if (err.statusCode !== 400) {
          throw new Error(`Expected 400 for weak password, got ${err.statusCode}`);
        }
      }
    }
    console.log('✔ [7.1] Password policy strictly enforces min 8 chars, uppercase, lowercase, and numbers.');

    // 8. Same password rejection
    try {
      await profileService.changePassword(employee._id, {
        currentPassword: 'Password123!',
        newPassword: 'Password123!',
        confirmPassword: 'Password123!',
      });
      throw new Error('Same password should have been rejected.');
    } catch (err) {
      if (err.statusCode !== 400) {
        throw new Error(`Expected 400 for same password, got ${err.statusCode}`);
      }
      console.log('✔ [8.1] Changing to current password properly rejected with HTTP 400.');
    }

    // 5. Successful password change
    const dummyRes = {
      cookie: () => {},
    };
    const pwdChangeRes = await profileService.changePassword(
      employee._id,
      {
        currentPassword: 'Password123!',
        newPassword: 'UpdatedPassword2026!',
        confirmPassword: 'UpdatedPassword2026!',
      },
      dummyRes
    );
    if (!pwdChangeRes?.message) {
      throw new Error('Password change failed.');
    }
    console.log('✔ [5.1] Password successfully changed with strong requirements.');

    // Verify password hash in DB
    const freshEmp = await User.findById(employee._id).select('+password');
    const isNewMatch = await freshEmp.comparePassword('UpdatedPassword2026!');
    const isOldMatch = await freshEmp.comparePassword('Password123!');
    if (!isNewMatch || isOldMatch) {
      throw new Error('Password update verification failed in database.');
    }
    console.log('✔ [5.2] Database password verification confirmed.');

    // --- 9, 10, 11. Testing Notification Preferences ---
    console.log('\n--- 9-11. Testing Notification Preferences ---');
    const prefs = await profileService.getPreferences(employee._id);
    if (typeof prefs.taskAssignments !== 'boolean' || typeof prefs.leaveUpdates !== 'boolean') {
      throw new Error('getPreferences did not return boolean preferences.');
    }
    console.log('✔ [9.1] getPreferences returns complete preferences structure.');

    // 10. Update preferences
    const updatedPrefs = await profileService.updatePreferences(employee._id, {
      taskAssignments: false,
      leaveUpdates: false,
    });
    if (updatedPrefs.taskAssignments !== false || updatedPrefs.leaveUpdates !== false) {
      throw new Error('Failed to update notification preferences.');
    }
    console.log('✔ [10.1] Notification preferences successfully updated.');

    // 11. Preference whitelist
    const maliciousPrefs = await profileService.updatePreferences(employee._id, {
      role: 'ADMIN',
      department: 'Hacked',
      taskAssignments: true,
    });
    if (maliciousPrefs.role !== undefined) {
      throw new Error('Preferences endpoint leaked non-preference fields.');
    }
    console.log('✔ [11.1] Notification preferences endpoint enforces strict key whitelist.');

    // --- 16. Testing Notification Preference Integration ---
    console.log('\n--- 16. Testing Notification Preference Integration ---');
    const empForNotif = await User.findById(employee._id);

    // 16.1 Disable taskAssignments
    empForNotif.notificationPreferences.taskAssignments = false;
    await empForNotif.save();

    const suppressedNotif = await notificationService.createNotification({
      recipient: empForNotif._id,
      type: NOTIFICATION_TYPE.TASK_ASSIGNED,
      title: 'New Task Assigned',
      message: 'You have been assigned a task',
    });
    if (suppressedNotif !== null) {
      throw new Error('Notification was created despite taskAssignments preference being set to false!');
    }
    console.log('✔ [16.1] Task notification successfully suppressed when user preference is disabled.');

    // 16.2 Re-enable taskAssignments
    empForNotif.notificationPreferences.taskAssignments = true;
    await empForNotif.save();

    const permittedNotif = await notificationService.createNotification({
      recipient: empForNotif._id,
      type: NOTIFICATION_TYPE.TASK_ASSIGNED,
      title: 'New Task Assigned',
      message: 'You have been assigned a task',
    });
    if (!permittedNotif || permittedNotif.title !== 'New Task Assigned') {
      throw new Error('Notification was not created when taskAssignments preference is enabled.');
    }
    console.log('✔ [16.2] Task notification successfully created when user preference is enabled.');

    // --- 17, 18. Testing Audit Activities ---
    console.log('\n--- 17-18. Testing Audit Activities ---');
    const profileActivities = await Activity.find({
      actor: employee._id,
      action: { $in: ['PROFILE_UPDATED', 'PASSWORD_CHANGED', 'PREFERENCES_UPDATED'] },
    });
    if (profileActivities.length < 2) {
      throw new Error('Expected PROFILE_UPDATED and PASSWORD_CHANGED entries in Activity audit trail.');
    }
    for (const act of profileActivities) {
      if (act.metadata?.password || act.metadata?.newPassword || act.metadata?.passwordHash) {
        throw new Error('Sensitive password value found in Activity audit log!');
      }
    }
    console.log('✔ [17.1] Profile updates and password changes logged in Activity feed without sensitive data.');

    // --- 19. Testing RBAC Isolation ---
    console.log('\n--- 19. Testing RBAC Isolation ---');
    const adminProfile = await profileService.getProfile(admin._id);
    const mgrProfile = await profileService.getProfile(manager._id);

    if (adminProfile.role !== 'ADMIN' || mgrProfile.role !== 'MANAGER') {
      throw new Error('Admin/Manager profile role mismatch.');
    }
    console.log('✔ [19.1] RBAC isolation verified: each role independently accesses personal profile.');

    // --- 20-23. Testing Phase 10-13 Regressions ---
    console.log('\n--- 20-23. Testing Phase 10-13 Regressions ---');
    // Phase 13 AI status
    const aiStatus = aiService.getAIStatus();
    if (typeof aiStatus.enabled !== 'boolean') {
      throw new Error('Phase 13 AI status failed regression check.');
    }

    // Phase 12 Analytics Overview
    const analyticsRes = await analyticsService.getOverviewAnalytics({ user: admin });
    if (!analyticsRes?.employees || analyticsRes.scope !== 'ORGANIZATION') {
      throw new Error('Phase 12 Analytics overview failed regression check.');
    }

    // Phase 11 Notifications
    const unreadRes = await notificationService.getUnreadCount(admin._id);
    if (typeof unreadRes.unreadCount !== 'number') {
      throw new Error('Phase 11 Notification unread count failed regression check.');
    }

    console.log('✔ [20-23.1] All Phase 10-13 foundational services verified and fully operational.');

    console.log('\n==================================================');
    console.log('=== ALL PHASE 14 TESTS PASSED SUCCESSFULLY! ===');
    console.log('==================================================\n');
  } catch (error) {
    console.error('\n❌ PHASE 14 TEST FAILED:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

runPhase14Tests();
