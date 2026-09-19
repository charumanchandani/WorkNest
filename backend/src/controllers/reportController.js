import { analyticsService } from '../services/analyticsService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { getTodayDateString } from '../constants/attendance.js';

/**
 * @desc    Generate operational reports in JSON or CSV format
 * @route   GET /api/reports/:type
 * @access  Private (Role-scoped RBAC)
 */
export const getReport = async (req, res, next) => {
  try {
    const { type } = req.params;
    const { from, to, department, status, format = 'json' } = req.query;

    const reportData = await analyticsService.getReportData({
      user: req.user,
      type,
      from,
      to,
      department,
      status,
    });

    if (String(format).toLowerCase() === 'csv') {
      const csvContent = analyticsService.generateReportCsv(reportData);
      const today = getTodayDateString();
      const filename = `worknest-${type}-report-${today}.csv`;

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.status(200).send(csvContent);
    }

    return sendSuccess(
      res,
      200,
      `${type.charAt(0).toUpperCase() + type.slice(1)} report generated successfully`,
      reportData
    );
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};
