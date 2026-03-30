import * as adminService from '../../services/admin.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

/**
 * Get aggregated dashboard metrics
 */
export const getMetrics = async (req, res) => {
  try {
    const metrics = await adminService.getDashboardMetrics();
    return sendSuccess(res, metrics, "Dashboard metrics retrieved successfully");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Get dispatch queue for dashboard
 */
export const getDispatchQueue = async (req, res) => {
  try {
    const queue = await adminService.getDashboardDispatchQueue();
    return sendSuccess(res, queue, "Dispatch queue retrieved successfully");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Get revenue analytics for dashboard chart
 */
export const getRevenue = async (req, res) => {
  try {
    const { timeframe } = req.query; // 'hourly', 'daily', 'weekly'
    const revenue = await adminService.getDashboardRevenue(timeframe);
    return sendSuccess(res, revenue, "Dashboard revenue retrieved successfully");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Get fleet monitoring status for dashboard
 */
export const getFleet = async (req, res) => {
  try {
    const fleet = await adminService.getDashboardFleet();
    return sendSuccess(res, fleet, "Dashboard fleet retrieved successfully");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};
