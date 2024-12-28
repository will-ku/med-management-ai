import { ZodSchema } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export function createMCPJsonSchema(zodSchema: ZodSchema) {
  const fullSchema = zodToJsonSchema(zodSchema);
  const schemaDefinition = fullSchema.definitions || {};

  const { additionalProperties, description, ...cleanSchema } =
    schemaDefinition;

  return cleanSchema;
}
