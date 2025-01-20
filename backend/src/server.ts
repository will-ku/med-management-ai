import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { apiRouter } from "./api/routes.js";
import { initializeDatabase } from "./db/init.js";
import { ClientManager } from "./mcp/ClientManager.js";
import { MessageHandler } from "./services/MessageHandler.js";

main().catch((err) => console.error(err));

async function main() {
  dotenv.config();
  await initializeDatabase();
  initializeApi();
  MessageHandler.getInstance();
  await ClientManager.getInstance();
}

function initializeApi() {
  const app = express();
  const port = process.env.PORT || 3000;

  app.use(cors());
  app.use(express.json());

  app.use("/api", apiRouter);

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}
