import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { apiRouter } from "./api/routes.js";
import { initializeDatabase } from "./db/init.js";

main().catch((err) => console.error(err));

async function main() {
  dotenv.config();
  await initializeDatabase();
  initializeApi();
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
