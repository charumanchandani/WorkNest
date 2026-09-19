import { aiService } from '../services/aiService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

/**
 * @desc    Get AI availability and status
 * @route   GET /api/ai/status
 * @access  Private
 */
export const getAIStatus = async (req, res, next) => {
  try {
    const status = aiService.getAIStatus();
    return sendSuccess(res, 200, 'AI status retrieved successfully', status);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * @desc    Generate structured AI summary of a task
 * @route   POST /api/ai/task-summary
 * @access  Private
 */
export const getTaskSummary = async (req, res, next) => {
  try {
    const { taskId } = req.body;
    const result = await aiService.generateTaskSummary({
      user: req.user,
      taskId,
    });
    return sendSuccess(res, 200, 'Task summary generated successfully', result);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * @desc    Draft a professional leave application message with AI
 * @route   POST /api/ai/leave-draft
 * @access  Private
 */
export const generateLeaveDraft = async (req, res, next) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    const result = await aiService.generateLeaveRequestDraft({
      user: req.user,
      leaveType,
      startDate,
      endDate,
      reason,
    });
    return sendSuccess(res, 200, 'Leave draft generated successfully', result);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * @desc    Summarize accessible document contents with AI
 * @route   POST /api/ai/document-summary
 * @access  Private
 */
export const getDocumentSummary = async (req, res, next) => {
  try {
    const { documentId } = req.body;
    const result = await aiService.generateDocumentSummary({
      user: req.user,
      documentId,
    });
    return sendSuccess(res, 200, 'Document summary generated successfully', result);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * @desc    Generate role-scoped productivity insights from live operational data
 * @route   POST /api/ai/productivity-insight
 * @access  Private
 */
export const getProductivityInsight = async (req, res, next) => {
  try {
    const { from, to } = req.body;
    const result = await aiService.generateProductivityInsight({
      user: req.user,
      from,
      to,
    });
    return sendSuccess(res, 200, 'Productivity insight generated successfully', result);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};
