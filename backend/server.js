import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDB from "./src/config/db.js";
import eventRoutes from "./src/routes/eventRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import dns from "node:dns/promises";

dotenv.config();

const app = express();

dns.setServers(["1.1.1.1", "1.0.0.1"]);

// CORS — allow frontend origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.FRONTEND_URL, // production frontend URL
].filter(Boolean);

app.use(cors());

app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'CalVolt API is running' });
});

// Routes
app.use('/api/events', eventRoutes);
app.use('/api/auth', authRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

const startServer = async () => {
  const PORT = process.env.PORT || 5000;
  await connectDB();
  app.listen(PORT, () => {
    console.log(`CalVolt API running on port ${PORT}`);
  });
};

startServer();