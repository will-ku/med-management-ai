import { z } from "zod";

export const PrescriptionSchema = z.object({
  medicationId: z.number(),
  dosage: z.string(),
  frequency: z.string(),
});

export type Prescription = z.infer<typeof PrescriptionSchema>;
