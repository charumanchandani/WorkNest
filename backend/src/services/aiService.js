import mongoose from 'mongoose';
import { ENV } from '../config/env.js';
import Task from '../models/Task.js';
import Document from '../models/Document.js';
import Department from '../models/Department.js';
import storageService from './storageService.js';
import analyticsService from './analyticsService.js';
import activityService from './activityService.js';
import { ACTIVITY_ACTION, ACTIVITY_ENTITY_TYPE } from '../constants/activity.js';

// In-Memory Sliding Window Rate Limiter (20 requests per minute per user)
const userRateLimits = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 20;

/**
 * Checks and enforces user rate limit for AI operations
 */
export const enforceRateLimit = (userId) => {
  const now = Date.now();
  const userKey = userId.toString();

  let timestamps = userRateLimits.get(userKey) || [];
  // Filter out timestamps older than the window
  timestamps = timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);

  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    const err = new Error('Rate limit exceeded. Please wait before requesting AI assistance again.');
    err.statusCode = 429;
    throw err;
  }

  timestamps.push(now);
  userRateLimits.set(userKey, timestamps);
};

/**
 * Cleans up expired rate limiter entries periodically to avoid memory leaks
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamps] of userRateLimits.entries()) {
    const active = timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
    if (active.length === 0) {
      userRateLimits.delete(key);
    } else {
      userRateLimits.set(key, active);
    }
  }
}, 5 * 60 * 1000).unref?.();

/**
 * Validates whether AI is enabled
 */
export const checkAIEnabled = () => {
  if (!ENV.AI_ENABLED && ENV.AI_PROVIDER !== 'mock') {
    const err = new Error('AI assistance is currently unavailable.');
    err.statusCode = 503;
    throw err;
  }
};

/**
 * Provider Execution Adapter (Mock Provider + Gemini Provider)
 */
export const callAIProvider = async ({ systemInstruction, userPrompt, mockGenerator }) => {
  checkAIEnabled();

  // 1. Mock Provider (Default for tests and offline development)
  if (ENV.AI_PROVIDER === 'mock' || !ENV.AI_API_KEY) {
    return mockGenerator();
  }

  // 2. Google Gemini REST Provider
  if (ENV.AI_PROVIDER === 'gemini') {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${ENV.AI_MODEL}:generateContent?key=${ENV.AI_API_KEY}`;

      const requestBody = {
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: userPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1000,
          responseMimeType: 'application/json',
        },
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`AI Provider HTTP Error: ${response.status}`);
      }

      const responseJson = await response.json();
      const contentText = responseJson?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!contentText) {
        throw new Error('AI Provider returned empty candidate text.');
      }

      return JSON.parse(contentText);
    } catch {
      // Fallback to safe deterministic output if provider call encounters transient error
      return mockGenerator();
    }
  }

  return mockGenerator();
};

export const aiService = {
  /**
   * 0. AI System Status Check
   */
  getAIStatus() {
    return {
      enabled: Boolean(ENV.AI_ENABLED || ENV.AI_PROVIDER === 'mock'),
      provider: ENV.AI_PROVIDER,
      model: ENV.AI_MODEL,
    };
  },

  /**
   * 1. Task Summarization
   */
  async generateTaskSummary({ user, taskId }) {
    enforceRateLimit(user._id);

    if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
      const err = new Error('Valid task identifier is required.');
      err.statusCode = 400;
      throw err;
    }

    const task = await Task.findById(taskId)
      .populate('department', 'name code manager')
      .populate('assignedTo', 'name email department')
      .populate('assignedBy', 'name email');

    if (!task) {
      const err = new Error('Task not found.');
      err.statusCode = 404;
      throw err;
    }

    // RBAC Authorization Check
    if (user.role === 'EMPLOYEE') {
      const isAssignee = task.assignedTo?._id?.equals(user._id);
      const isAssigner = task.assignedBy?._id?.equals(user._id);
      if (!isAssignee && !isAssigner) {
        const err = new Error('You do not have permission to view or summarize this task.');
        err.statusCode = 403;
        throw err;
      }
    } else if (user.role === 'MANAGER') {
      const managedDepts = await Department.find({ manager: user._id }).select('_id');
      const managedDeptIds = managedDepts.map((d) => d._id.toString());

      const isDeptMatch = task.department && managedDeptIds.includes(task.department._id.toString());
      const isAssignee = task.assignedTo?._id?.equals(user._id);
      const isAssigner = task.assignedBy?._id?.equals(user._id);

      if (!isDeptMatch && !isAssignee && !isAssigner) {
        const err = new Error('You do not have permission to summarize tasks outside your management scope.');
        err.statusCode = 403;
        throw err;
      }
    }

    // Minimized payload
    const taskContext = {
      title: task.title,
      description: task.description || 'No detailed description provided.',
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate,
      department: task.department?.name || 'Unassigned',
      assignedTo: task.assignedTo?.name || 'Unassigned',
    };

    const systemInstruction =
      'You are a concise enterprise workplace AI assistant. Summarize the task into JSON with keys: summary (string), keyPoints (array of short strings), nextAction (string). Do not hallucinate or make sensitive claims.';

    const userPrompt = `Task Information:\n${JSON.stringify(taskContext, null, 2)}`;

    const mockGenerator = () => {
      const isOverdue =
        task.status !== 'COMPLETED' &&
        task.status !== 'CANCELLED' &&
        task.dueDate < new Date().toISOString().slice(0, 10);

      const nextAction =
        task.status === 'COMPLETED'
          ? 'Task is complete; verify deliverables.'
          : isOverdue
          ? `Priority deadline passed on ${task.dueDate}; expedite completion.`
          : `Proceed with next milestone before deadline (${task.dueDate}).`;

      return {
        summary: `Task "${task.title}" is currently ${task.status.replace('_', ' ')} with ${task.priority} priority assigned to ${taskContext.assignedTo}.`,
        keyPoints: [
          `Priority Level: ${task.priority}`,
          `Status: ${task.status.replace('_', ' ')}`,
          `Target Due Date: ${task.dueDate}`,
          `Scope: ${task.department} department`,
        ],
        nextAction,
      };
    };

    const result = await callAIProvider({
      systemInstruction,
      userPrompt,
      mockGenerator,
    });

    // Record Safe Audit Activity
    await activityService.createActivity({
      actor: user._id,
      action: ACTIVITY_ACTION.AI_TASK_SUMMARY,
      entityType: ACTIVITY_ENTITY_TYPE.TASK,
      entityId: task._id,
      description: `${user.name} generated AI summary for task "${task.title}".`,
      metadata: { taskId: task._id.toString(), priority: task.priority },
    });

    return {
      taskId: task._id.toString(),
      taskTitle: task.title,
      summary: result.summary || 'Summary generated.',
      keyPoints: Array.isArray(result.keyPoints) ? result.keyPoints : [],
      nextAction: result.nextAction || 'Continue scheduled work.',
    };
  },

  /**
   * 2. Leave Request Drafting Assistance
   */
  async generateLeaveRequestDraft({ user, leaveType, startDate, endDate, reason }) {
    enforceRateLimit(user._id);

    if (!reason || typeof reason !== 'string' || reason.trim().length < 2) {
      const err = new Error('Please provide initial rough notes or reason for your leave.');
      err.statusCode = 400;
      throw err;
    }

    if (reason.length > 1000) {
      const err = new Error('Reason input is too long (maximum 1000 characters).');
      err.statusCode = 400;
      throw err;
    }

    const cleanType = leaveType || 'ANNUAL';
    const cleanStart = startDate || 'Upcoming dates';
    const cleanEnd = endDate || cleanStart;

    const systemInstruction =
      'You are a professional HR workplace writing assistant. Transform informal notes into a polite, respectful, and concise workplace leave application message in JSON with keys: draft (string), tone (string). Never invent medical diagnoses, company approvals, or policies.';

    const userPrompt = `User Notes: "${reason.trim()}"\nLeave Type: ${cleanType}\nDuration: ${cleanStart} to ${cleanEnd}\nEmployee Name: ${user.name}`;

    const mockGenerator = () => {
      let draftText = `Dear Management,\n\nI would like to formally request ${cleanType.toLowerCase()} leave from ${cleanStart} to ${cleanEnd}.\n\nReason: ${reason.trim()}\n\nI will ensure my priority responsibilities and handovers are coordinated before my time off. Thank you for considering my request.\n\nBest regards,\n${user.name}`;

      if (cleanType === 'SICK') {
        draftText = `Dear Management,\n\nI am writing to request sick leave starting from ${cleanStart} through ${cleanEnd} due to personal health recovery (${reason.trim()}).\n\nI will keep the team updated on my return and assist with urgent matters once well. Thank you for understanding.\n\nBest regards,\n${user.name}`;
      }

      return {
        draft: draftText,
        tone: 'professional',
      };
    };

    const result = await callAIProvider({
      systemInstruction,
      userPrompt,
      mockGenerator,
    });

    // Record Safe Audit Activity
    await activityService.createActivity({
      actor: user._id,
      action: ACTIVITY_ACTION.AI_LEAVE_DRAFT,
      entityType: ACTIVITY_ENTITY_TYPE.LEAVE,
      description: `${user.name} generated AI leave request draft for ${cleanType} leave.`,
      metadata: { leaveType: cleanType, startDate: cleanStart, endDate: cleanEnd },
    });

    return {
      draft: result.draft || '',
      tone: result.tone || 'professional',
      leaveType: cleanType,
      startDate: cleanStart,
      endDate: cleanEnd,
    };
  },

  /**
   * 3. Document Summarization
   */
  async generateDocumentSummary({ user, documentId }) {
    enforceRateLimit(user._id);

    if (!documentId || !mongoose.Types.ObjectId.isValid(documentId)) {
      const err = new Error('Valid document identifier is required.');
      err.statusCode = 400;
      throw err;
    }

    const doc = await Document.findById(documentId)
      .select('+fileName')
      .populate('department', 'name code manager')
      .populate('uploadedBy', 'name email');

    if (!doc) {
      const err = new Error('Document not found.');
      err.statusCode = 404;
      throw err;
    }

    // RBAC Authorization Check
    if (user.role !== 'ADMIN') {
      if (doc.status !== 'ACTIVE') {
        const err = new Error('Document is archived and not accessible.');
        err.statusCode = 404;
        throw err;
      }

      if (doc.expiresAt && new Date(doc.expiresAt) < new Date()) {
        const err = new Error('Document has expired.');
        err.statusCode = 404;
        throw err;
      }

      if (doc.visibility === 'DEPARTMENT') {
        let isAuthorized = false;
        const userDeptId = user.department ? user.department.toString() : null;
        const docDeptId = doc.department ? (doc.department._id || doc.department).toString() : null;

        if (userDeptId && docDeptId && userDeptId === docDeptId) {
          isAuthorized = true;
        }

        if (!isAuthorized && user.role === 'MANAGER' && docDeptId) {
          const managesDept = await Department.exists({
            _id: docDeptId,
            manager: user._id,
            status: 'ACTIVE',
          });
          if (managesDept) isAuthorized = true;
        }

        if (!isAuthorized) {
          const err = new Error('You do not have authorization to view or summarize this department document.');
          err.statusCode = 403;
          throw err;
        }
      }
    }

    // Determine if file is plain text or unsupported binary
    const isPlainText =
      doc.mimeType === 'text/plain' ||
      doc.originalFileName.toLowerCase().endsWith('.txt') ||
      doc.originalFileName.toLowerCase().endsWith('.md');

    if (!isPlainText) {
      return {
        documentId: doc._id.toString(),
        documentTitle: doc.title,
        isSupported: false,
        summary: 'AI summary is not available for this document type.',
        keyPoints: [
          `File format: ${doc.mimeType || 'Binary'}`,
          'Direct text summarization is supported for plain-text documents (.txt, .md).',
          `File size: ${(doc.size / 1024).toFixed(1)} KB`,
        ],
        importantActions: 'Please download the original file to view full binary document content.',
      };
    }

    // Safe plain text reading (up to 10KB)
    let extractedText = doc.description || '';
    try {
      const filePath = storageService.getFileDownloadPath(doc.fileName);
      const fileBuffer = await import('fs').then((fs) => fs.promises.readFile(filePath));
      const textContent = fileBuffer.toString('utf-8').slice(0, 10000);
      if (textContent.trim()) {
        extractedText = textContent;
      }
    } catch {
      // Non-blocking fallback to metadata description
    }

    const systemInstruction =
      'You are a workplace document analysis assistant. Summarize the provided document into JSON with keys: summary (string), keyPoints (array of strings), importantActions (string). Do not hallucinate.';

    const userPrompt = `Document Title: ${doc.title}\nCategory: ${doc.category}\nContent:\n${extractedText}`;

    const mockGenerator = () => ({
      summary: `Document "${doc.title}" covers organizational ${doc.category.toLowerCase()} guidelines and operational procedures.`,
      keyPoints: [
        `Category: ${doc.category}`,
        `Visibility: ${doc.visibility}`,
        doc.description ? `Overview: ${doc.description.slice(0, 120)}...` : 'Comprehensive organizational policy documentation.',
      ],
      importantActions: 'Review policy guidelines and ensure departmental adherence.',
    });

    const result = await callAIProvider({
      systemInstruction,
      userPrompt,
      mockGenerator,
    });

    // Record Safe Audit Activity
    await activityService.createActivity({
      actor: user._id,
      action: ACTIVITY_ACTION.AI_DOCUMENT_SUMMARY,
      entityType: ACTIVITY_ENTITY_TYPE.DOCUMENT,
      entityId: doc._id,
      description: `${user.name} summarized document "${doc.title}".`,
      metadata: { documentId: doc._id.toString(), category: doc.category },
    });

    return {
      documentId: doc._id.toString(),
      documentTitle: doc.title,
      isSupported: true,
      summary: result.summary || 'Summary generated.',
      keyPoints: Array.isArray(result.keyPoints) ? result.keyPoints : [],
      importantActions: result.importantActions || 'Review document specifics.',
    };
  },

  /**
   * 4. Productivity & Performance Insights
   */
  async generateProductivityInsight({ user, from, to }) {
    enforceRateLimit(user._id);

    // Retrieve live aggregated analytics scoped strictly to user role
    const [overview, tasksAnalytics, attendanceAnalytics, leaveAnalytics] = await Promise.all([
      analyticsService.getOverviewAnalytics({ user, from, to }),
      analyticsService.getTaskAnalytics({ user, from, to }),
      analyticsService.getAttendanceAnalytics({ user, from, to }),
      analyticsService.getLeaveAnalytics({ user, from, to }),
    ]);

    const scopeRole = overview.scope;
    const dateRange = overview.dateRange;

    const sanitizedMetrics = {
      scope: scopeRole,
      dateRange,
      tasks: tasksAnalytics.summary,
      attendance: attendanceAnalytics.summary,
      leaves: leaveAnalytics.summary,
    };

    const systemInstruction =
      'You are a workplace productivity analytics assistant. Provide factual, objective operational insights based solely on the provided numbers in JSON format with keys: overview (string), trends (array of strings), recommendations (array of strings). Do NOT make sensitive personality judgments or health conclusions.';

    const userPrompt = `Operational Metrics:\n${JSON.stringify(sanitizedMetrics, null, 2)}`;

    const mockGenerator = () => {
      const completionRate = tasksAnalytics.summary?.completionRate ?? 0;
      const overdueCount = tasksAnalytics.summary?.overdue ?? 0;
      const attRate = attendanceAnalytics.summary?.attendanceRate ?? 0;
      const avgHours = attendanceAnalytics.summary?.averageHoursPerDay ?? 0;

      const trends = [
        `Task completion rate stands at ${completionRate}% with ${overdueCount} overdue item(s).`,
        `Attendance rate during this period is ${attRate}% with an average of ${avgHours} hours logged per productive day.`,
        `${leaveAnalytics.summary?.approved ?? 0} leave request(s) approved totaling ${leaveAnalytics.summary?.totalApprovedDays ?? 0} days.`,
      ];

      const recommendations = [
        overdueCount > 0
          ? `Address the ${overdueCount} overdue deliverable(s) to restore pipeline momentum.`
          : 'Maintain current turnaround cadence on open task milestones.',
        'Ensure daily clock-in/out timestamps are logged accurately before 09:30 AM.',
      ];

      return {
        overview: `Performance analysis for ${scopeRole.toLowerCase()} scope across ${dateRange.from} to ${dateRange.to} reflects ${completionRate}% task completion and ${attRate}% attendance reliability.`,
        trends,
        recommendations,
      };
    };

    const result = await callAIProvider({
      systemInstruction,
      userPrompt,
      mockGenerator,
    });

    // Record Safe Audit Activity
    await activityService.createActivity({
      actor: user._id,
      action: ACTIVITY_ACTION.AI_PRODUCTIVITY_INSIGHT,
      entityType: ACTIVITY_ENTITY_TYPE.ANALYTICS,
      description: `${user.name} generated AI productivity insight for ${scopeRole.toLowerCase()} scope.`,
      metadata: { scope: scopeRole, from: dateRange.from, to: dateRange.to },
    });

    return {
      scope: scopeRole,
      dateRange,
      overview: result.overview || 'Overview generated.',
      trends: Array.isArray(result.trends) ? result.trends : [],
      recommendations: Array.isArray(result.recommendations) ? result.recommendations : [],
    };
  },
};

export default aiService;
