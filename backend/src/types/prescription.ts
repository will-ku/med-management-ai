import { z } from "zod";

export const PrescriptionSchema = z.object({
  medicationId: z.number(),
  dosage: z.string(),
  frequency: z.string(),
});

export const PrescriptionUpdateSchema = z.object({
  id: z.number(),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
});

export type Prescription = z.infer<typeof PrescriptionSchema>;
export type PrescriptionWithMedication = Prescription & {
  medicationName: string;
};
export type PrescriptionUpdate = z.infer<typeof PrescriptionUpdateSchema>;

// MCP Server Args
export interface DeletePrescriptionArgs {
  id: number;
}

export interface UpdatePrescriptionArgs {
  id: number;
  dosage?: string;
  frequency?: string;
}

// Type guards
export function isValidDeletePrescriptionArgs(
  args: any
): args is DeletePrescriptionArgs {
  return (
    typeof args === "object" &&
    args !== null &&
    "id" in args &&
    typeof args.id === "number"
  );
}
