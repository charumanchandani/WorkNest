import mongoose from 'mongoose';
import { ENV } from '../config/env.js';
import User from '../models/User.js';
import Department from '../models/Department.js';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import Task from '../models/Task.js';
import Document from '../models/Document.js';
import Activity from '../models/Activity.js';
import aiService, { enforceRateLimit } from '../services/aiService.js';
import storageService from '../services/storageService.js';
import analyticsService from '../services/analyticsService.js';
import attendanceService from '../services/attendanceService.js';
import leaveService from '../services/leaveService.js';
import taskService from '../services/taskService.js';
import { seedDatabase } from './seedUsers.js';
import { ATTENDANCE_STATUS, getTodayDateString } from '../constants/attendance.js';
import { LEAVE_STATUS, LEAVE_TYPES } from '../constants/leave.js';
import { TASK_STATUS, TASK_PRIORITY } from '../constants/task.js';

const runTests = async () => {
  console.log('==================================================');
  console.log('=== STARTING PHASE 13 AI ASSISTANCE TEST SUITE ===');
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

    // Seed test users & departments
    await seedDatabase();

    const admin = await User.findOne({ email: 'admin@worknest.io' });
    const manager = await User.findOne({ email: 'manager@worknest.io' }); // Marcus Vance (ENG lead)
    const employee = await User.findOne({ email: 'employee@worknest.io' }); // Elena Rostova
    const davidChen = await User.findOne({ email: 'david.chen@worknest.io' }); // David Chen (ENG)

    const engDept = await Department.findOne({ code: 'ENG' });
    const hrDept = await Department.findOne({ code: 'HR' });

    if (!admin || !manager || !employee || !davidChen || !engDept || !hrDept) {
      throw new Error('Could not load test seed users & departments.');
    }

    console.log('[Setup] Test fixtures verified.');

    // Clear previous collections for predictable test results
    await Attendance.deleteMany({});
    await Leave.deleteMany({});
    await Task.deleteMany({});
    await Document.deleteMany({});
    await Activity.deleteMany({});

    const today = getTodayDateString();

    // 1. Seed sample task
    const testTask = await Task.create({
      title: 'Implement Microservice Health Checks',
      description: 'Add live readiness and liveness probe endpoints for kubernetes deployment.',
      assignedTo: davidChen._id,
      assignedBy: manager._id,
      department: engDept._id,
      priority: TASK_PRIORITY.HIGH,
      status: TASK_STATUS.IN_PROGRESS,
      dueDate: today,
    });

    const unassignedTask = await Task.create({
      title: 'Executive Audit Review',
      description: 'Confidential executive governance audit.',
      assignedTo: admin._id,
      assignedBy: admin._id,
      department: hrDept._id,
      priority: TASK_PRIORITY.URGENT,
      status: TASK_STATUS.TODO,
      dueDate: '2028-12-31',
    });

    // 2. Seed plain text document and binary document
    const textStorageResult = await storageService.saveFileFromBuffer(
      Buffer.from('WorkNest Engineering Code Review Guidelines\n1. Check test coverage.\n2. Verify lint clean.', 'utf-8'),
      'guidelines.txt',
      'text/plain'
    );

    const textDoc = await Document.create({
      title: 'Engineering Code Review Guidelines',
      description: 'Standard code review rules for engineering teams.',
      category: 'GUIDELINE',
      originalFileName: textStorageResult.originalFileName,
      fileName: textStorageResult.storageKey,
      mimeType: textStorageResult.mimeType,
      size: textStorageResult.size,
      uploadedBy: manager._id,
      department: engDept._id,
      visibility: 'DEPARTMENT',
      status: 'ACTIVE',
    });

    const binaryStorageResult = await storageService.saveFileFromBuffer(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      'architecture-diagram.png',
      'image/png'
    );

    const binaryDoc = await Document.create({
      title: 'Architecture Diagram',
      description: 'High level system diagram.',
      category: 'TRAINING',
      originalFileName: binaryStorageResult.originalFileName,
      fileName: binaryStorageResult.storageKey,
      mimeType: binaryStorageResult.mimeType,
      size: binaryStorageResult.size,
      uploadedBy: manager._id,
      department: engDept._id,
      visibility: 'DEPARTMENT',
      status: 'ACTIVE',
    });

    // 3. Seed attendance & leave for productivity insights
    await Attendance.create({
      employee: davidChen._id,
      date: today,
      status: ATTENDANCE_STATUS.PRESENT,
      totalMinutes: 480,
      checkIn: new Date(),
    });

    await Leave.create({
      employee: davidChen._id,
      leaveType: LEAVE_TYPES.ANNUAL,
      startDate: today,
      endDate: today,
      totalDays: 1,
      reason: 'Personal time off',
      status: LEAVE_STATUS.APPROVED,
    });

    console.log('[Setup] Seeded AI test fixtures.');

    // ==========================================
    // 1. AI STATUS CHECK
    // ==========================================
    console.log('\n--- 1. Testing AI Status ---');
    const aiStatus = aiService.getAIStatus();
    if (typeof aiStatus.enabled !== 'boolean') {
      throw new Error('AI status enabled should be a boolean.');
    }
    console.log(`✔ [1.1] AI status verified: enabled=${aiStatus.enabled}, provider=${aiStatus.provider}`);

    // ==========================================
    // 2. TASK SUMMARIZATION (Authorized & Scope)
    // ==========================================
    console.log('\n--- 2. Testing Task Summarization ---');
    const taskSummary = await aiService.generateTaskSummary({
      user: davidChen,
      taskId: testTask._id.toString(),
    });

    if (!taskSummary || !taskSummary.summary || !Array.isArray(taskSummary.keyPoints) || !taskSummary.nextAction) {
      throw new Error('Task summary structure is missing required fields.');
    }
    console.log('✔ [2.1] Assignee successfully generated structured task summary.');

    const mgrTaskSummary = await aiService.generateTaskSummary({
      user: manager,
      taskId: testTask._id.toString(),
    });
    if (!mgrTaskSummary || !mgrTaskSummary.summary) {
      throw new Error('Manager failed to summarize team task.');
    }
    console.log('✔ [2.2] Manager successfully summarized managed department task.');

    // ==========================================
    // 3. TASK SUMMARY AUTHORIZATION (403 Forbidden)
    // ==========================================
    console.log('\n--- 3. Testing Task Authorization Security ---');
    let empBlocked = false;
    try {
      // Employee trying to summarize unrelated HR task
      await aiService.generateTaskSummary({
        user: employee,
        taskId: unassignedTask._id.toString(),
      });
    } catch (err) {
      if (err.statusCode === 403) empBlocked = true;
    }
    if (!empBlocked) {
      throw new Error('Employee should be blocked with 403 from summarizing unauthorized task!');
    }
    console.log('✔ [3.1] Unauthorized task summarization properly blocked with HTTP 403.');

    // ==========================================
    // 4. LEAVE REQUEST DRAFTING ASSISTANCE
    // ==========================================
    console.log('\n--- 4. Testing Leave Request Drafting Assistance ---');
    const roughNote = 'meri tabiyat kharab hai 2 din chutti chahiye';
    const leaveDraft = await aiService.generateLeaveRequestDraft({
      user: employee,
      leaveType: 'SICK',
      startDate: '2026-10-01',
      endDate: '2026-10-02',
      reason: roughNote,
    });

    if (!leaveDraft || !leaveDraft.draft || leaveDraft.tone !== 'professional') {
      throw new Error('Leave drafting assistance failed to return structured draft.');
    }
    if (!leaveDraft.draft.toLowerCase().includes('sick leave')) {
      throw new Error('Leave draft should reflect the selected leave type.');
    }
    console.log('✔ [4.1] Rough notes successfully transformed into professional workplace leave draft.');

    // ==========================================
    // 5. DOCUMENT SUMMARIZATION (Plain-Text)
    // ==========================================
    console.log('\n--- 5. Testing Plain-Text Document Summarization ---');
    const docSummary = await aiService.generateDocumentSummary({
      user: davidChen,
      documentId: textDoc._id.toString(),
    });

    if (!docSummary || !docSummary.isSupported || !docSummary.summary || !Array.isArray(docSummary.keyPoints)) {
      throw new Error('Document summary failed for plain text document.');
    }
    console.log('✔ [5.1] Plain text document successfully summarized with key points.');

    // ==========================================
    // 6. DOCUMENT UNSUPPORTED BINARY TYPE
    // ==========================================
    console.log('\n--- 6. Testing Unsupported Binary Document Type Handling ---');
    const binaryDocSummary = await aiService.generateDocumentSummary({
      user: davidChen,
      documentId: binaryDoc._id.toString(),
    });

    if (!binaryDocSummary || binaryDocSummary.isSupported !== false) {
      throw new Error('Binary document should return isSupported: false.');
    }
    if (!binaryDocSummary.summary.includes('not available for this document type')) {
      throw new Error('Binary document did not return the expected safe advisory.');
    }
    console.log('✔ [6.1] Binary document handled safely without crashing or binary parsing errors.');

    // ==========================================
    // 7. DOCUMENT AUTHORIZATION (403 Forbidden)
    // ==========================================
    console.log('\n--- 7. Testing Document Authorization Security ---');
    let docEmpBlocked = false;
    try {
      // Employee not in ENG trying to summarize ENG department doc
      await aiService.generateDocumentSummary({
        user: employee,
        documentId: textDoc._id.toString(),
      });
    } catch (err) {
      if (err.statusCode === 403) docEmpBlocked = true;
    }
    if (!docEmpBlocked) {
      throw new Error('Employee should be blocked from summarizing unassigned department document.');
    }
    console.log('✔ [7.1] Unauthorized department document access properly blocked with HTTP 403.');

    // ==========================================
    // 8. PRODUCTIVITY INSIGHTS (Employee, Manager, Admin)
    // ==========================================
    console.log('\n--- 8. Testing Productivity & Performance Insights ---');
    const empInsight = await aiService.generateProductivityInsight({
      user: davidChen,
    });
    if (!empInsight || !empInsight.overview || !Array.isArray(empInsight.trends)) {
      throw new Error('Productivity insight generation failed for employee.');
    }
    console.log('✔ [8.1] Employee personal productivity insight generated.');

    const adminInsight = await aiService.generateProductivityInsight({
      user: admin,
    });
    if (!adminInsight || adminInsight.scope !== 'ORGANIZATION') {
      throw new Error('Admin productivity insight must have ORGANIZATION scope.');
    }
    console.log('✔ [8.2] Admin organization-wide productivity insight generated.');

    // ==========================================
    // 9. INPUT VALIDATION & ERROR HANDLING (400 Bad Request)
    // ==========================================
    console.log('\n--- 9. Testing Input Validation ---');
    let invalidTaskIdCaught = false;
    try {
      await aiService.generateTaskSummary({ user: admin, taskId: 'not-a-valid-id' });
    } catch (err) {
      if (err.statusCode === 400) invalidTaskIdCaught = true;
    }
    if (!invalidTaskIdCaught) throw new Error('Invalid taskId should throw 400.');

    let emptyLeaveReasonCaught = false;
    try {
      await aiService.generateLeaveRequestDraft({ user: admin, reason: ' ' });
    } catch (err) {
      if (err.statusCode === 400) emptyLeaveReasonCaught = true;
    }
    if (!emptyLeaveReasonCaught) throw new Error('Empty leave reason should throw 400.');

    let oversizedReasonCaught = false;
    try {
      await aiService.generateLeaveRequestDraft({ user: admin, reason: 'A'.repeat(1500) });
    } catch (err) {
      if (err.statusCode === 400) oversizedReasonCaught = true;
    }
    if (!oversizedReasonCaught) throw new Error('Oversized leave reason should throw 400.');
    console.log('✔ [9.1] Input validation correctly catches malformed IDs and oversized text with HTTP 400.');

    // ==========================================
    // 10. RATE LIMITING (429 Too Many Requests)
    // ==========================================
    console.log('\n--- 10. Testing In-Memory Rate Limiter ---');
    const rateLimitTestUserId = new mongoose.Types.ObjectId();
    for (let i = 0; i < 20; i++) {
      enforceRateLimit(rateLimitTestUserId);
    }

    let rateLimitCaught = false;
    try {
      enforceRateLimit(rateLimitTestUserId);
    } catch (err) {
      if (err.statusCode === 429) rateLimitCaught = true;
    }
    if (!rateLimitCaught) {
      throw new Error('Rate limit was not enforced after exceeding max requests window!');
    }
    console.log('✔ [10.1] Rate limiter correctly blocks excessive AI calls with HTTP 429.');

    // ==========================================
    // 11. AI ACTIVITY AUDIT TRAIL
    // ==========================================
    console.log('\n--- 11. Testing AI Activity Logging ---');
    const aiActivities = await Activity.find({
      action: {
        $in: [
          'AI_TASK_SUMMARY',
          'AI_LEAVE_DRAFT',
          'AI_DOCUMENT_SUMMARY',
          'AI_PRODUCTIVITY_INSIGHT',
        ],
      },
    });

    if (aiActivities.length < 4) {
      throw new Error(`Expected at least 4 AI activity entries, found ${aiActivities.length}`);
    }
    console.log(`✔ [11.1] Verified ${aiActivities.length} operational AI audit log entries in Activity feed.`);

    // ==========================================
    // 12. SENSITIVE FIELD EXCLUSION
    // ==========================================
    console.log('\n--- 12. Testing Sensitive Data Protection ---');
    for (const act of aiActivities) {
      const metaStr = JSON.stringify(act.metadata);
      if (metaStr.toLowerCase().includes('password') || metaStr.toLowerCase().includes('jwt')) {
        throw new Error('AI activity metadata contains sensitive credentials!');
      }
    }
    console.log('✔ [12.1] Verified no passwords or sensitive tokens logged in AI activities.');

    // ==========================================
    // 13. PHASE 0-12 REGRESSION VERIFICATION
    // ==========================================
    console.log('\n--- 13. Testing Phase 0-12 Regression ---');
    const overview = await analyticsService.getOverviewAnalytics({ user: admin });
    if (!overview || overview.scope !== 'ORGANIZATION') throw new Error('Analytics regression.');

    const attToday = await attendanceService.getTodayAttendance(admin._id);
    if (!attToday) throw new Error('Attendance regression.');

    const leaves = await leaveService.getMyLeaves({ userId: davidChen._id });
    if (!leaves) throw new Error('Leave regression.');

    const tasks = await taskService.getMyTasks({ userId: davidChen._id });
    if (!tasks) throw new Error('Task regression.');

    console.log('✔ [13.1] All Phase 0-12 core modules intact and fully functional.');

    console.log('\n==================================================');
    console.log('=== ALL PHASE 13 TESTS PASSED SUCCESSFULLY! ===');
    console.log('==================================================');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ PHASE 13 TEST FAILURE:', error);
    process.exit(1);
  }
};

runTests();
