import sqlite3 from "sqlite3";
import fs from "fs";
import path from "path";
import { MEDICATIONS_TO_SEED, PRESCRIPTIONS_TO_SEED } from "./seed.js";

export const DB_PATH = "/app/data/med_management.db";

export const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error("Error opening database:", err);
  } else {
    console.log("Database connection established");
  }
});

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

export async function initializeDatabase(): Promise<void> {
  console.log("Initializing database...");

  // Ensure the database directory exists
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

  // Touch the database file if it doesn't exist
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, "");
    console.log("Created new database file");
  }

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      try {
        // Create tables first
        db.run(CREATE_MEDICATIONS_TABLE);
        db.run(CREATE_PRESCRIPTIONS_TABLE);

        // Clear existing data
        db.run("DELETE FROM prescriptions", (err) => {
          if (err && !err.message.includes("no such table")) {
            console.error("Error clearing prescriptions:", err);
          }
        });

        db.run("DELETE FROM medications", (err) => {
          if (err && !err.message.includes("no such table")) {
            console.error("Error clearing medications:", err);
          }
        });

        // Reset autoincrement
        db.run(
          "DELETE FROM sqlite_sequence WHERE name='medications' OR name='prescriptions'",
          (err) => {
            if (err && !err.message.includes("no such table")) {
              console.error("Error resetting sequences:", err);
            }
          }
        );

        createMedicationsTable();
        createPrescriptionsTable();
        console.log("Database initialized successfully!");
        resolve();
      } catch (error) {
        console.error("Database initialization error:", error);
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
