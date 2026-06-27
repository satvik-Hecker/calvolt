import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDB from "./src/config/db.js";
dotenv.config();

import dns from "node:dns/promises";   
dns.setServers(["1.1.1.1", "1.0.0.1"]);

const app = express();
app.use(cors());
app.use(express.json());

const startServer = async () => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  await connectDB();
};

startServer();
