import { z } from "zod";

export const hierarchicalCategorySchemaCreate = z.object({
  name: z.string().max(100).min(1, "El nombre es obligatorio"), // nombre obligatorio
  description: z.string().max(500).optional(), // descripción opcional
  excluded_from_evaluation: z.boolean().default(false), // excluida de evaluación
  hasObjectives: z.boolean().default(false), // tiene objetivos
});

export const hierarchicalCategorySchemaUpdate =
  hierarchicalCategorySchemaCreate.partial();

export type HierarchicalCategorySchema = z.infer<
  typeof hierarchicalCategorySchemaCreate
>;
