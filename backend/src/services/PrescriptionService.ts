import { Database } from "sqlite3";
import {
  PrescriptionUpdate,
  PrescriptionWithMedication,
} from "../types/prescription.js";

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

  async updatePrescription(
    id: number,
    prescriptionUpdate: PrescriptionUpdate
  ): Promise<void> {
    // Implementation for update
  }

  async deletePrescription(id: number): Promise<void> {
    // Implementation for delete
  }
}
