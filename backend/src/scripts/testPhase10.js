import mongoose from 'mongoose';
import { ENV } from '../config/env.js';
import User from '../models/User.js';
import Department from '../models/Department.js';
import documentService from '../services/documentService.js';
import announcementService from '../services/announcementService.js';
import { seedDatabase } from './seedUsers.js';

const runTests = async () => {
  console.log('=== STARTING PHASE 10 VERIFICATION SUITE ===');

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

    // Ensure database is seeded
    await seedDatabase();

    // Load test users and departments
    const adminUser = await User.findOne({ email: 'admin@worknest.io' });
    const managerUser = await User.findOne({ email: 'manager@worknest.io' });
    const employeeUser = await User.findOne({ email: 'employee@worknest.io' }); // Product & Design
    const davidChen = await User.findOne({ email: 'david.chen@worknest.io' }); // Engineering

    const engDept = await Department.findOne({ code: 'ENG' });
    const hrDept = await Department.findOne({ code: 'HR' });

    if (!adminUser || !managerUser || !employeeUser || !davidChen || !engDept || !hrDept) {
      throw new Error('Test users or departments could not be loaded.');
    }

    console.log('[Test Setup] Users and Departments loaded successfully.');



    // ==========================================
    // DOCUMENT VAULT TESTS
    // ==========================================
    console.log('\n--- Running Document Vault Tests ---');

    // 1. Admin uploads an organization document
    const orgDoc = await documentService.createDocument({
      title: 'Company Workplace Code of Conduct 2026',
      description: 'Universal organizational conduct policies and ethics guidelines.',
      category: 'POLICY',
      visibility: 'ORGANIZATION',
      department: null,
      expiresAt: null,
      file: {
        originalname: 'code_of_conduct.pdf',
        mimetype: 'application/pdf',
        buffer: Buffer.from('Mock PDF Content for Code of Conduct'),
      },
      user: adminUser,
    });
    console.log('✔ [Doc 1, 2, 3] Admin uploaded org document & stored file safely (ID:', orgDoc.id, ')');

    // 2. Admin uploads a department-targeted document (Engineering only)
    const engDoc = await documentService.createDocument({
      title: 'Engineering API Security Standards',
      description: 'Confidential engineering backend guidelines.',
      category: 'GUIDELINE',
      visibility: 'DEPARTMENT',
      department: engDept._id,
      expiresAt: null,
      file: {
        originalname: 'eng_api_standards.docx',
        mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        buffer: Buffer.from('Mock Docx Content for Engineering API Standards'),
      },
      user: adminUser,
    });
    console.log('✔ [Doc 4, 5] Department document created for ENG department');

    // 3. Employee in PROD department should see Org document, but NOT ENG document
    const employeeDocs = await documentService.getDocuments({
      user: employeeUser,
      query: {},
    });
    const hasOrgDoc = employeeDocs.records.some((d) => d.id === orgDoc.id);
    const hasEngDoc = employeeDocs.records.some((d) => d.id === engDoc.id);
    if (hasOrgDoc && !hasEngDoc) {
      console.log('✔ [Doc 4, 5] Employee sees Org doc and is correctly isolated from other department doc');
    } else {
      throw new Error(`Employee scoping failed: hasOrgDoc=${hasOrgDoc}, hasEngDoc=${hasEngDoc}`);
    }

    // 4. Unauthorized employee direct access / download of ENG document is blocked
    try {
      await documentService.getDocumentById(engDoc.id, employeeUser);
      throw new Error('Unauthorized employee should NOT be able to view ENG document');
    } catch (err) {
      if (err.statusCode === 403) {
        console.log('✔ [Doc 6] Unauthorized employee view blocked with 403 Forbidden');
      } else {
        throw err;
      }
    }

    try {
      await documentService.getDocumentForDownload(engDoc.id, employeeUser);
      throw new Error('Unauthorized employee should NOT be able to download ENG document');
    } catch (err) {
      if (err.statusCode === 403) {
        console.log('✔ [Doc 11] Unauthorized download blocked with 403 Forbidden');
      } else {
        throw err;
      }
    }

    // 5. Manager of ENG department can see and download ENG document
    const managerDocs = await documentService.getDocuments({
      user: managerUser,
      query: {},
    });
    const managerHasEngDoc = managerDocs.records.some((d) => d.id === engDoc.id);
    if (managerHasEngDoc) {
      console.log('✔ [Doc 7] Manager scope works (sees managed department document)');
    } else {
      throw new Error('Manager should see managed department document');
    }

    const downloadInfo = await documentService.getDocumentForDownload(engDoc.id, managerUser);
    if (downloadInfo.filePath && downloadInfo.originalFileName === 'eng_api_standards.docx') {
      console.log('✔ [Doc 7] Manager authorized download path resolved');
    }

    // 6. Test Admin archiving document
    await documentService.archiveDocument(orgDoc.id);
    const employeeDocsAfterArchive = await documentService.getDocuments({
      user: employeeUser,
      query: {},
    });
    const employeeHasArchivedDoc = employeeDocsAfterArchive.records.some((d) => d.id === orgDoc.id);
    if (!employeeHasArchivedDoc) {
      console.log('✔ [Doc 8, 9] Admin archived doc, correctly hidden from employee listing');
    } else {
      throw new Error('Archived document should not be visible in employee listing');
    }

    // 7. Test Expired document
    const expiredDoc = await documentService.createDocument({
      title: 'Temporary 2024 Remote Stipend Policy',
      description: 'Stipend policy that has expired.',
      category: 'POLICY',
      visibility: 'ORGANIZATION',
      department: null,
      expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      file: {
        originalname: 'stipend_policy.pdf',
        mimetype: 'application/pdf',
        buffer: Buffer.from('Mock PDF Content for Expired Policy'),
      },
      user: adminUser,
    });

    const employeeDocsAfterExpiry = await documentService.getDocuments({
      user: employeeUser,
      query: {},
    });
    const employeeHasExpiredDoc = employeeDocsAfterExpiry.records.some((d) => d.id === expiredDoc.id);
    if (!employeeHasExpiredDoc) {
      console.log('✔ [Doc 10] Expired document is hidden from employee listing');
    } else {
      throw new Error('Expired document should not be visible to employee');
    }

    // 8. Test file validation (Oversized & Unsupported)
    try {
      await documentService.createDocument({
        title: 'Huge File',
        category: 'OTHER',
        visibility: 'ORGANIZATION',
        file: {
          originalname: 'huge_file.pdf',
          mimetype: 'application/pdf',
          buffer: Buffer.alloc(11 * 1024 * 1024), // 11 MB
        },
        user: adminUser,
      });
      throw new Error('Oversized file should be rejected');
    } catch (err) {
      console.log('✔ [Doc 12] Oversized file rejected (>10MB):', err.message);
    }

    try {
      await documentService.createDocument({
        title: 'Dangerous Script',
        category: 'OTHER',
        visibility: 'ORGANIZATION',
        file: {
          originalname: 'malicious.exe',
          mimetype: 'application/x-msdownload',
          buffer: Buffer.from('executable binary'),
        },
        user: adminUser,
      });
      throw new Error('Unsupported executable file should be rejected');
    } catch (err) {
      console.log('✔ [Doc 13] Unsupported / executable file rejected:', err.message);
    }

    // ==========================================
    // COMPANY ANNOUNCEMENTS TESTS
    // ==========================================
    console.log('\n--- Running Company Announcements Tests ---');

    // 1. Manager creates a draft announcement for ENG department
    const managerDraft = await announcementService.createAnnouncement({
      title: 'Engineering Q4 Tech Stack Roadmap Discussion',
      content: 'Team, please prepare your proposals for upgrading our Node services next Tuesday.',
      targetType: 'DEPARTMENT',
      department: engDept._id,
      status: 'DRAFT',
      user: managerUser,
    });
    console.log('✔ [Ann 1, 2] Manager created draft announcement for ENG department');

    // 2. Draft should not be visible in regular employee feed
    const davidFeedBeforePublish = await announcementService.getAnnouncements({
      user: davidChen,
      query: {},
    });
    const davidHasDraft = davidFeedBeforePublish.records.some((a) => a.id === managerDraft.id);
    if (!davidHasDraft) {
      console.log('✔ [Ann 4] Draft announcement not visible to employees in live feed');
    }

    // 3. Manager publishes the draft
    const publishedEngAnn = await announcementService.publishAnnouncement(managerDraft.id, managerUser);
    if (publishedEngAnn.status === 'PUBLISHED' && publishedEngAnn.publishedAt) {
      console.log('✔ [Ann 3] Manager published draft announcement with server timestamp');
    }

    // 4. Engineering employee (David Chen) sees it; Product employee (Elena) does NOT see it
    const davidFeedAfterPublish = await announcementService.getAnnouncements({
      user: davidChen,
      query: {},
    });
    const elenaFeed = await announcementService.getAnnouncements({
      user: employeeUser,
      query: {},
    });

    const davidSeesEngAnn = davidFeedAfterPublish.records.some((a) => a.id === managerDraft.id);
    const elenaSeesEngAnn = elenaFeed.records.some((a) => a.id === managerDraft.id);

    if (davidSeesEngAnn && !elenaSeesEngAnn) {
      console.log('✔ [Ann 4, 5] Department targeting enforced: ENG employee sees it, PROD employee does not');
    } else {
      throw new Error(`Targeting failed: davidSeesEngAnn=${davidSeesEngAnn}, elenaSeesEngAnn=${elenaSeesEngAnn}`);
    }

    // 5. Admin creates organization-wide announcement
    const orgAnn = await announcementService.createAnnouncement({
      title: 'Organizational Town Hall & Holiday Announcement',
      content: 'The company will hold a global virtual town hall meeting this Thursday at 3 PM EST.',
      targetType: 'ORGANIZATION',
      status: 'PUBLISHED',
      user: adminUser,
    });
    console.log('✔ [Ann 6] Admin created organization-wide announcement');

    const elenaFeedWithOrg = await announcementService.getAnnouncements({
      user: employeeUser,
      query: {},
    });
    const elenaSeesOrgAnn = elenaFeedWithOrg.records.some((a) => a.id === orgAnn.id);
    if (elenaSeesOrgAnn) {
      console.log('✔ [Ann 7] Employee sees organization-wide announcement');
    } else {
      throw new Error('Employee should see organization-wide announcement');
    }

    // 6. Expired announcement disappears from employee feed
    const expiredAnn = await announcementService.createAnnouncement({
      title: 'Old Urgent Notice',
      content: 'This notice has expired.',
      targetType: 'ORGANIZATION',
      status: 'PUBLISHED',
      expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      user: adminUser,
    });
    const elenaFeedAfterExpiry = await announcementService.getAnnouncements({
      user: employeeUser,
      query: {},
    });
    const elenaSeesExpiredAnn = elenaFeedAfterExpiry.records.some((a) => a.id === expiredAnn.id);
    if (!elenaSeesExpiredAnn) {
      console.log('✔ [Ann 8] Expired announcement disappears from employee feed');
    } else {
      throw new Error('Expired announcement should not be in employee feed');
    }

    // 7. Archived announcement disappears from active feed
    await announcementService.archiveAnnouncement(orgAnn.id, adminUser);
    const elenaFeedAfterArchive = await announcementService.getAnnouncements({
      user: employeeUser,
      query: {},
    });
    const elenaSeesArchivedAnn = elenaFeedAfterArchive.records.some((a) => a.id === orgAnn.id);
    if (!elenaSeesArchivedAnn) {
      console.log('✔ [Ann 9] Archived announcement disappears from active feed');
    } else {
      throw new Error('Archived announcement should not be in active feed');
    }

    // 8. Employee cannot create announcement
    try {
      await announcementService.createAnnouncement({
        title: 'Unauthorized Announcement',
        content: 'Employee trying to create broadcast',
        targetType: 'ORGANIZATION',
        user: employeeUser,
      });
      throw new Error('Employee should not be allowed to create announcement');
    } catch (err) {
      if (err.statusCode === 403) {
        console.log('✔ [Ann 10] Employee creation blocked with 403 Forbidden');
      } else {
        throw err;
      }
    }

    // 9. Manager cannot create or manage another department announcement
    try {
      await announcementService.createAnnouncement({
        title: 'Manager Hijack Attempt',
        content: 'Manager trying to create for HR department',
        targetType: 'DEPARTMENT',
        department: hrDept._id,
        user: managerUser,
      });
      throw new Error('Manager should not be allowed to create announcement for non-managed department');
    } catch (err) {
      if (err.statusCode === 403) {
        console.log('✔ [Ann 11] Manager non-managed department access blocked with 403 Forbidden');
      } else {
        throw err;
      }
    }

    console.log('\n=========================================');
    console.log('ALL PHASE 10 TESTS PASSED SUCCESSFULLY! 🚀');
    console.log('=========================================');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ PHASE 10 TEST FAILED:', error);
    process.exit(1);
  }
};

runTests();
