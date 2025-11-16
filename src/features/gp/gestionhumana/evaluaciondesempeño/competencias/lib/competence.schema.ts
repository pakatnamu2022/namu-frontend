import { z } from "zod";

export const subCompetenceSchema = z.object({
  id: z.number().optional(),
  nombre: z.string().min(1, "Requerido"),
  definicion: z.string().max(500).nullable().optional(),
  level1: z.string().nullable().optional(),
  level2: z.string().nullable().optional(),
  level3: z.string().nullable().optional(),
  level4: z.string().nullable().optional(),
  level5: z.string().nullable().optional(),
});

export const competenceSchemaCreate = z.object({
  nombre: z.string().min(1),
  subCompetences: z
    .array(subCompetenceSchema)
    .min(1, "Agrega al menos una subcompetencia"),
});

export const competenceSchemaUpdate = competenceSchemaCreate.partial();

export type SubCompetenceSchema = z.infer<typeof subCompetenceSchema>;
export type CompetenceSchema = z.infer<typeof competenceSchemaCreate>;
