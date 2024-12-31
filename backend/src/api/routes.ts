import express from "express";
import { db } from "../db/init.js";

export const apiRouter = express.Router();

// Health Check
apiRouter.get("/", async (req, res) => {
  res.json({ hello: "world" });
});

// Natural language query endpoint to LLM
apiRouter.post("/query", async (req, res) => {
  try {
    const { query } = req.body;
    res.json({ message: "Hello, world!" });
  } catch (error: unknown) {
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
  db.all(
    // Move this into a Controller
    ` SELECT 
      p.*,
      m.name as medication_name,
      m.dosage as medication_dosage,
      m.frequency as medication_frequency
    FROM prescriptions p
    LEFT JOIN medications m ON p.medication_id = m.id
  `,
    [],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message }); // TODO: Handle error
        return;
      }
      res.json(rows);
    }
  );
});
