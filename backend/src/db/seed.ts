import { Medication } from "../types/medication";

export const MEDICATIONS_TO_SEED: Medication[] = [
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
