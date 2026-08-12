import { z } from "zod";

export const conceptObjectivePvSchemaCreate = z.object({
  id: z.number().optional(),
  area_id: z
    .string()
    .refine((value) => value.trim() !== "", { message: "Área es requerida" }),
  description: z.string().refine((value) => value.trim() !== "", {
    message: "Descripción es requerida",
  }),
  is_vehicular_crossing: z.boolean().optional().default(false),
  type_planning_ids: z.array(z.number()).optional().default([]),
});

export const conceptObjectivePvSchemaUpdate =
  conceptObjectivePvSchemaCreate.partial();

export type ConceptObjectivePvSchema = z.infer<
  typeof conceptObjectivePvSchemaCreate
>;
