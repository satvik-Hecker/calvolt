import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDB from "./src/config/db.js";
import eventRoutes from "./src/routes/eventRoutes.js"; 
import authRoutes from "./src/routes/authRoutes.js";
import dns from "node:dns/promises"; 

dotenv.config();
dns.setServers(["1.1.1.1", "1.0.0.1"]);

const app = express();


app.use(cors());
app.use(express.json());

// Basic Health Check Route (Highly recommended to keep)
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'API is running' });
});


app.use('/api/events', eventRoutes);
app.use('/api/auth', authRoutes);
const startServer = async () => {
  const PORT = process.env.PORT || 5000;
  
  
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();