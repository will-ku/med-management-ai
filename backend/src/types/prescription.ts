import { z } from "zod";

export const PrescriptionSchema = z.object({
  medicationId: z.number(),
  dosage: z.string(),
  frequency: z.string(),
});

export const PrescriptionUpdateSchema = z.object({
  medicationId: z.number(),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
});

export type Prescription = z.infer<typeof PrescriptionSchema>;
export type PrescriptionUpdate = z.infer<typeof PrescriptionUpdateSchema>;
