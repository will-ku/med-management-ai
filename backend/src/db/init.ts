import sqlite3 from "sqlite3";
import { MedicationTuple } from "./types";

export const db = new sqlite3.Database("./data/med_management.db");

const MEDICATIONS_TO_SEED: MedicationTuple[] = [
  ["Amoxicillin", "500mg", "Every 8 hours"],
  ["Lisinopril", "10mg", "Once daily"],
  ["Metformin", "1000mg", "Twice daily"],
  ["Sertraline", "50mg", "Once daily"],
  ["Ibuprofen", "400mg", "Every 6 hours as needed"],
  ["Omeprazole", "20mg", "Once daily"],
  ["Levothyroxine", "75mcg", "Once daily on empty stomach"],
  ["Amlodipine", "5mg", "Once daily"],
  ["Metoprolol", "25mg", "Twice daily"],
  ["Gabapentin", "300mg", "Three times daily"],
];

const CREATE_MEDICATIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS medications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

export function initializeDatabase(): void {
  db.serialize(() => {
    db.run(CREATE_MEDICATIONS_TABLE);
    const query = db.prepare(
      "INSERT INTO medications (name, dostage, frequency) VALUES (?, ?, ?)"
    );

    MEDICATIONS_TO_SEED.forEach(([medName, dosage, frequency]) => {
      query.run(medName, dosage, frequency);
    });
    query.finalize();
  });
}
