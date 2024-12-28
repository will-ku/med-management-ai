import sqlite3 from "sqlite3";
import { MEDICATIONS_TO_SEED } from "./seed.js";

export const db = new sqlite3.Database("./data/med_management.db");

const CREATE_MEDICATIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS medications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

const CREATE_PRESCRIPTIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS prescriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    medication_id INTEGER,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

export function initializeDatabase(): void {
  db.serialize(() => {
    createMedicationsTable();
    createPrescriptionsTable();
  });
}

function createMedicationsTable(): void {
  db.serialize(() => {
    // Create the medications table
    db.run(CREATE_MEDICATIONS_TABLE);

    // Seed the medications table
    const query = db.prepare(
      "INSERT INTO medications (name, dosage, frequency) VALUES (?, ?, ?)"
    );
    MEDICATIONS_TO_SEED.forEach(({ medName, dosage, frequency }) => {
      query.run(medName, dosage, frequency);
    });

    // Finalize the query
    query.finalize();
  });
}

function createPrescriptionsTable(): void {
  db.serialize(() => {
    db.run(CREATE_PRESCRIPTIONS_TABLE);
  });
}
