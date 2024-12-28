import { z } from "zod";

export const MedicationSchema = z.object({
  medName: z.string(),
  dosage: z.string(),
  frequency: z.string(),
});

export type Medication = z.infer<typeof MedicationSchema>;
