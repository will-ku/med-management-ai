import sqlite3 from "sqlite3";
import { Medication } from "../types/medication";

export const db = new sqlite3.Database("./data/med_management.db");

const MEDICATIONS_TO_SEED: Medication[] = [
  { medName: "Amoxicillin", dosage: "500mg", frequency: "Every 8 hours" },
  { medName: "Lisinopril", dosage: "10mg", frequency: "Once daily" },
  { medName: "Metformin", dosage: "1000mg", frequency: "Twice daily" },
  { medName: "Sertraline", dosage: "50mg", frequency: "Once daily" },
  {
    medName: "Ibuprofen",
    dosage: "400mg",
    frequency: "Every 6 hours as needed",
  },
  { medName: "Omeprazole", dosage: "20mg", frequency: "Once daily" },
  {
    medName: "Levothyroxine",
    dosage: "75mcg",
    frequency: "Once daily on empty stomach",
  },
  { medName: "Amlodipine", dosage: "5mg", frequency: "Once daily" },
  { medName: "Metoprolol", dosage: "25mg", frequency: "Twice daily" },
  { medName: "Gabapentin", dosage: "300mg", frequency: "Three times daily" },
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
      "INSERT INTO medications (name, dosage, frequency) VALUES (?, ?, ?)"
    );

    MEDICATIONS_TO_SEED.forEach(({ medName, dosage, frequency }) => {
      query.run(medName, dosage, frequency);
    });
    query.finalize();
  });
}
