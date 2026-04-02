import * as adminService from '../../services/admin.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { updateFarmerStatusSchema } from '../../schema/farmer.schema.js';

/**
 * Get bookings for admin dashboard with pagination and filters.
 */
export const getBookings = async (req, res) => {
  try {
    const { page, limit, status, search } = req.query;
    const result = await adminService.getAllBookings({ page, limit, status, search });
    return sendSuccess(res, result, "Bookings retrieved successfully");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Get specific booking details.
 */
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await adminService.getBookingById(id);
    return sendSuccess(res, booking, "Booking details retrieved successfully");
  } catch (error) {
    const statusCode = error.message.includes('not found') ? 404 : 500;
    return sendError(res, error.message, statusCode);
  }
};

/**
 * Get all payments and revenue stats.
 */
export const getPayments = async (req, res) => {
  try {
    const { page, limit, status, search } = req.query;
    const data = await adminService.getAllPayments({ page, limit, status, search });
    return sendSuccess(res, data, "Admin payment data retrieved successfully");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Handle Admin Settlement.
 */
export const settleBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    if (!bookingId) return sendError(res, "Booking ID is required", 400);

    const result = await adminService.settleBooking(bookingId);
    return sendSuccess(res, result, "Booking settled successfully");
  } catch (error) {
    const statusCode = error.message.includes('Already Paid') ? 400 : 
                       error.message.includes('not found') ? 404 : 500;
    return sendError(res, error.message, statusCode);
  }
};

/**
 * Get all farmers for management.
 */
export const getFarmers = async (req, res) => {
  try {
    const farmers = await adminService.getAllFarmers();
    return sendSuccess(res, farmers, "Farmers retrieved successfully");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Update farmer account status.
 */
export const updateFarmerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = updateFarmerStatusSchema.parse(req.body);

    const result = await adminService.updateFarmerStatus(id, status);
    return sendSuccess(res, result, `Farmer status updated to ${status}`);
  } catch (error) {
    if (error.name === 'ZodError') {
      return sendError(res, error.errors[0].message, 400);
    }
    const statusCode = error.message.includes('not found') ? 404 : 500;
    return sendError(res, error.message, statusCode);
  }
};
