import sqlite3 from "sqlite3";
import { MEDICATIONS_TO_SEED, PRESCRIPTIONS_TO_SEED } from "./seed.js";

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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (medication_id) REFERENCES medications(id)
  )
`;

export function initializeDatabase(): Promise<void> {
  console.log("Initializing database...");
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      try {
        // Clear existing data first
        db.run("DELETE FROM prescriptions");
        db.run("DELETE FROM medications");

        // Reset the autoincrement counters
        db.run(
          "DELETE FROM sqlite_sequence WHERE name='medications' OR name='prescriptions'"
        );

        createMedicationsTable();
        createPrescriptionsTable();
        console.log("Database initialized successfully!");
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
}

function createMedicationsTable(): void {
  try {
    // Create the medications table
    db.run(CREATE_MEDICATIONS_TABLE);

    // Seed the medications table
    const query = db.prepare(
      "INSERT INTO medications (name, dosage, frequency) VALUES (?, ?, ?)"
    );
    MEDICATIONS_TO_SEED.forEach(({ name, dosage, frequency }) => {
      query.run(name, dosage, frequency);
    });
    query.finalize();
    console.log("Medications table created and seeded successfully!");
  } catch (error) {
    console.error("Error creating medications table:", error);
    throw error;
  }
}

function createPrescriptionsTable(): void {
  try {
    // Create the prescriptions table
    db.run(CREATE_PRESCRIPTIONS_TABLE);

    // Seed the prescriptions table
    const query = db.prepare(
      "INSERT INTO prescriptions (medication_id, dosage, frequency) VALUES (?, ?, ?)"
    );
    PRESCRIPTIONS_TO_SEED.forEach(({ medicationId, dosage, frequency }) => {
      query.run(medicationId, dosage, frequency);
    });
    query.finalize();
    console.log("Prescriptions table created and seeded successfully!");
  } catch (error) {
    console.error("Error creating prescriptions table:", error);
    throw error;
  }
}
