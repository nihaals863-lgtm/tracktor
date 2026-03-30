import express from 'express';
import * as bookingController from '../controllers/farmer/booking.controller.js';
import * as serviceController from '../controllers/farmer/service.controller.js';
import * as dashboardController from '../controllers/farmer/dashboard.controller.js';
import * as profileController from '../controllers/farmer/profile.controller.js';
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
