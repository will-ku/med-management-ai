import { Database } from "sqlite3";
import {
  Prescription,
  PrescriptionUpdate,
  PrescriptionWithMedication,
} from "../types/prescription.js";
import { RecordNotFoundError } from "./Errors.js";

export class PrescriptionService {
  private db: Database;
  constructor(db: Database) {
    this.db = db;
  }

  async getPrescriptions(): Promise<PrescriptionWithMedication[]> {
    console.log("=== Getting Prescriptions ===");
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT 
          p.*,
          m.name as medicationName
        FROM prescriptions p
        LEFT JOIN medications m ON p.medication_id = m.id`,
        [],
        (err: Error | null, rows: PrescriptionWithMedication[]) => {
          if (err) {
            console.error("Database error:", err);
            reject(err);
            return;
          }
          console.log("Query results:", rows);
          resolve(rows);
        }
      );
    });
  }

  async createPrescription({
    medicationId,
    dosage,
    frequency,
  }: Prescription): Promise<PrescriptionWithMedication> {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run(
          `INSERT INTO prescriptions (medication_id, dosage, frequency) VALUES (?, ?, ?)`,
          [medicationId, dosage, frequency],
          (err: Error | null) => {
            if (err) reject(err);
          }
        );

        this.db.get<PrescriptionWithMedication>(
          `SELECT p.*, m.name as medicationName
           FROM prescriptions p
           LEFT JOIN medications m ON p.medication_id = m.id
           ORDER BY p.id DESC LIMIT 1`,
          (err: Error | null, row: PrescriptionWithMedication) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });
    });
  }

  async updatePrescription({
    dosage,
    frequency,
    id,
  }: PrescriptionUpdate): Promise<PrescriptionWithMedication> {
    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE prescriptions SET 
          dosage = COALESCE(?, dosage),
          frequency = COALESCE(?, frequency)
        WHERE id = ?`,
        [dosage, frequency, id],
        (err: Error | null) => {
          if (err) {
            reject(err);
            return;
          }
          // Check if record exists using a separate query
          this.db.get(
            `SELECT 
              p.*,
              m.name as medicationName
            FROM prescriptions p
            LEFT JOIN medications m ON p.medication_id = m.id
            WHERE p.id = ?`,
            [id],
            (err: Error | null, row: PrescriptionWithMedication) => {
              if (err) {
                reject(err);
                return;
              }
              if (!row) {
                reject(new RecordNotFoundError("Prescription", id));
                return;
              }
              resolve(row);
            }
          );
        }
      );
    });
  }

  async deletePrescription(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        `DELETE FROM prescriptions WHERE id = ?`,
        [id],
        function (err: Error | null) {
          if (err) {
            reject(err);
            return;
          }
          if (this.changes === 0) {
            reject(new RecordNotFoundError("Prescription", id));
            return;
          }
          resolve();
        }
      );
    });
  }
}
