import { Database } from "sqlite3";
import { Prescription, PrescriptionUpdate } from "../types/prescription.js";

export class PrescriptionService {
  private db: Database;
  constructor(db: Database) {
    this.db = db;
  }

  async getPrescriptions(): Promise<Prescription[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT 
          p.*
        FROM prescriptions p`,
        [],
        (err: Error, rows: Prescription[]) => {
          if (err) reject(err);
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
