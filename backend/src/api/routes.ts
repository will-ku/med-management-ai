import express from "express";
import { db } from "../db/init.js";
import { PrescriptionService } from "../services/PrescriptionService.js";
import { ClientManager } from "../mcp/ClientManager.js";
import { OllamaService } from "../llm/OllamaService.js";
import { messageRouter } from "./messageRoutes.js";

export const apiRouter = express.Router();
apiRouter.use("/message", messageRouter);

// Natural language query endpoint to LLM
apiRouter.post("/query", async (req, res) => {
  try {
    const { query } = req.body;

    const clientManager = await ClientManager.getInstance();
    const mcpTools = await clientManager.listTools();

    const ollamaService = await OllamaService.getInstance();
    const chatResponse = await ollamaService.handleChat(query, mcpTools);

    res.json(chatResponse);
  } catch (error: unknown) {
    console.error("Error occurred while processing query.", error);
    if (error instanceof Error) {
      res.status(500).json({ error: error.message }); // TODO: Handle error codes correctly
    } else {
      res.status(500).json({ error: "An unknown error occurred" }); // TODO: Handle error codes correctly
    }
  }
});

// Medication CRUD operations
apiRouter.get("/medication", (req, res) => {
  db.all("SELECT * FROM medications", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message }); // TODO: Handle error
      return;
    }
    res.json(rows);
  });
});

apiRouter.get("/medication/:id", (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM medications WHERE id = ?", [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message }); // TODO: Handle error
      return;
    }
    res.json(row);
  });
});

// Prescription CRUD operations
apiRouter.get("/prescription", (req, res) => {
  const prescriptionService = new PrescriptionService(db);
  prescriptionService.getPrescriptions().then((prescriptions) => {
    res.json(prescriptions);
  });
});
