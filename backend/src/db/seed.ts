import { Medication } from "../types/medication.js";
import { Prescription } from "../types/prescription.js";

export const MEDICATIONS_TO_SEED: Medication[] = [
  { name: "Amoxicillin", dosage: "500mg", frequency: "Every 8 hours" },
  { name: "Lisinopril", dosage: "10mg", frequency: "Once daily" },
  { name: "Metformin", dosage: "1000mg", frequency: "Twice daily" },
  { name: "Sertraline", dosage: "50mg", frequency: "Once daily" },
  {
    name: "Ibuprofen",
    dosage: "400mg",
    frequency: "Every 6 hours as needed",
  },
  { name: "Omeprazole", dosage: "20mg", frequency: "Once daily" },
  {
    name: "Levothyroxine",
    dosage: "75mcg",
    frequency: "Once daily on empty stomach",
  },
  { name: "Amlodipine", dosage: "5mg", frequency: "Once daily" },
  { name: "Metoprolol", dosage: "25mg", frequency: "Twice daily" },
  { name: "Gabapentin", dosage: "300mg", frequency: "Three times daily" },
];

export const PRESCRIPTIONS_TO_SEED: Prescription[] = [
  { medicationId: 1, dosage: "500mg", frequency: "Every 8 hours" },
  { medicationId: 2, dosage: "10mg", frequency: "Once daily" },
];
