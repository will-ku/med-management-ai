import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { apiRouter } from "./api/routes.js";
import { initializeDatabase } from "./db/init.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// // Initialize database
initializeDatabase();

// // API Routes
app.use("/api", apiRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
