import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { apiRouter } from "./api/routes.js";
import { initializeDatabase } from "./db/init.js";
import { MedicationMCPServer } from "./mcp/MedicationMCPServer.js";

dotenv.config();

// Instantiate Medication MCP server
const medicationServer = new MedicationMCPServer();
medicationServer.run().catch((err) => console.error(err));

// // Initialize database
initializeDatabase();

// Instantiate Express API Server
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api", apiRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
