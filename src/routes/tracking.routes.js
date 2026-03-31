import express from 'express';
import * as trackingController from '../controllers/tracking.controller.js';
// import { verifyToken, requireRole } from '../middleware/auth.middleware.js'; // Optionally protect routes

const router = express.Router();

// Operator-side endpoint to update location
router.post('/update', trackingController.updateLocation);

// Admin-side endpoint to fetch latest locations
router.get('/latest', trackingController.getLatestLocations);

export default router;
