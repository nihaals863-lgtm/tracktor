import express from 'express';
import * as bookingController from '../controllers/farmer/booking.controller.js';
import * as serviceController from '../controllers/farmer/service.controller.js';
import * as dashboardController from '../controllers/farmer/dashboard.controller.js';
import * as profileController from '../controllers/farmer/profile.controller.js';
import { sendSuccess, sendError } from '../utils/response.js';
import * as settingsService from '../services/settings.service.js';
import { verifyToken, requireRole } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(verifyToken);
router.use(requireRole(['farmer']));

// Dashboard routes
router.get('/dashboard', dashboardController.getDashboard);
router.get('/recent-activity', dashboardController.getRecentActivity);
router.get('/upcoming-jobs', dashboardController.getUpcomingJobs);

// Service routes
router.get('/services', serviceController.listServices);

// Configuration routes
router.get('/settings/config', async (req, res) => {
  try {
    const config = await settingsService.getSystemConfig();
    return sendSuccess(res, config, "Configuration retrieved");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
});

// Zones route (for booking dropdown)
router.get('/zones', async (req, res) => {
  try {
    const zones = await settingsService.listZones();
    return sendSuccess(res, zones, "Zones retrieved");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
});

// Booking routes
router.post('/price-preview', bookingController.getPricePreview);
router.post('/bookings', bookingController.createBooking);
router.get('/bookings', bookingController.listBookings);
router.get('/bookings/:id', bookingController.getBooking);

// Profile routes
router.get('/profile', profileController.getProfile);
router.patch('/profile', profileController.updateProfile);
router.patch('/change-password', profileController.changePassword);
router.patch('/language', profileController.updateLanguage);

export default router;

