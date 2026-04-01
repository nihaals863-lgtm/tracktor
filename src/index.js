import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import farmerRoutes from './routes/farmer.routes.js';
import adminRoutes from './routes/admin.routes.js';
import operatorRoutes from './routes/operator.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import { sendError } from './utils/response.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/farmer', farmerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/operator', operatorRoutes);
app.use('/api/payments', paymentRoutes);

// Root Route
app.get('/', (req, res) => {
  res.json({ message: "TractorLink Backend API is running..." });
});

// 404 Handler
app.use((req, res) => {
  return sendError(res, "Route not found", 404, "NOT_FOUND");
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  return sendError(res, err.message || "Internal Server Error", err.status || 500);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
