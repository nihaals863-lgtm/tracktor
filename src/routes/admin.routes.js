import express from 'express';
import * as dispatchController from '../controllers/admin/dispatch.controller.js';
import * as adminController from '../controllers/admin/admin.controller.js';
import * as dashboardController from '../controllers/admin/dashboard.controller.js';
import * as reportController from '../controllers/admin/report.controller.js';
import { verifyToken, requireRole } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(verifyToken);
router.use(requireRole(['admin']));

// Dashboard APIs
router.get('/dashboard/metrics', dashboardController.getMetrics);
router.get('/dashboard/dispatch-queue', dashboardController.getDispatchQueue);
router.get('/dashboard/revenue', dashboardController.getRevenue);
router.get('/dashboard/fleet', dashboardController.getFleet);

// Finance & Bookings
router.get('/bookings', adminController.getBookings);
router.get('/bookings/:id', adminController.getBookingById);
router.get('/payments', adminController.getPayments);
router.post('/settle-booking/:bookingId', adminController.settleBooking);

// Dispatch feature
router.get('/pending-dispatch', dispatchController.getPendingBookings);
router.get('/operators', dispatchController.getAvailableOperators);
router.put('/assign/:bookingId', dispatchController.dispatchBooking);

// Farmers Management
router.get('/farmers', adminController.getFarmers);
router.post('/farmers', adminController.addFarmer);
router.put('/farmers/:id/status', adminController.updateFarmerStatus);

// Reports & Analytics
router.get('/reports/revenue', reportController.getRevenue);
router.get('/reports/service-usage', reportController.getServiceUsage);
router.get('/reports/fleet', reportController.getFleet);
router.get('/reports/farmers', reportController.getFarmers);

export default router;
