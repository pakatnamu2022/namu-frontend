import { z } from "zod";

export const conceptObjectiveAdvisorSchema = z.object({
  id: z.number().optional(),
  worker_id: z
    .string()
    .refine((value) => value.trim() !== "", {
      message: "Asesor es requerido",
    }),
  amount: z.coerce
    .number()
    .refine((value) => value >= 0, { message: "Monto debe ser mayor o igual a 0" }),
});

export const conceptObjectivePeriodPvSchema = z.object({
  master_concept_id: z.string().optional(),
  area_id: z
    .string()
    .refine((value) => value.trim() !== "", { message: "Área es requerida" }),
  description: z
    .string()
    .refine((value) => value.trim() !== "", {
      message: "Descripción es requerida",
    }),
  is_vehicular_crossing: z.boolean().optional().default(false),
  sub_amount: z.coerce
    .number()
    .refine((value) => value >= 0, { message: "Monto debe ser mayor o igual a 0" }),
  order: z.coerce.number().optional().default(0),
  type_planning_ids: z.array(z.number()).optional().default([]),
  advisors: z.array(conceptObjectiveAdvisorSchema).optional().default([]),
});

export type ConceptObjectiveAdvisorSchema = z.infer<
  typeof conceptObjectiveAdvisorSchema
>;

export type ConceptObjectivePeriodPvSchema = z.infer<
  typeof conceptObjectivePeriodPvSchema
>;
