import { z } from "zod";

export const MedicationSchema = z.object({
  name: z.string(),
  dosage: z.string(),
  frequency: z.string(),
});

export type Medication = z.infer<typeof MedicationSchema>;
export type MedicationTuple = [name: string, dosage: string, frequency: string];
