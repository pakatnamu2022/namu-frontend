import { z } from "zod";

const requiredId = (message: string) =>
  z
    .union([z.string(), z.number()])
    .refine((v) => v !== "" && v !== null && v !== undefined && Number(v) > 0, {
      message,
    });

export const interviewSchemaCreate = z.object({
  proceso_postulacion_id: requiredId("El proceso es obligatorio"),
  persona_id: requiredId("El postulante es obligatorio"),
  fase: requiredId("La fase es obligatoria"),
  entrevistador_id: z.union([z.string(), z.number()]).optional().or(z.literal("")),
  fecha_entrevista: z.string().optional().or(z.literal("")),
  observaciones: z.string().optional().or(z.literal("")),
});

export type InterviewSchema = z.infer<typeof interviewSchemaCreate>;

export const interviewScoreSchema = z.object({
  scores: z
    .array(
      z.object({
        sub_competencia_id: z.number(),
        puntaje: z.coerce.number().min(0).max(5),
      }),
    )
    .min(1),
});

export type InterviewScoreSchema = z.infer<typeof interviewScoreSchema>;

export const syncCompetencesSchema = z.object({
  sub_competencias: z
    .array(z.union([z.string(), z.number()]))
    .min(1, "Seleccione al menos una subcompetencia")
    .max(5, "Máximo 5 subcompetencias"),
});

export type SyncCompetencesSchema = z.infer<typeof syncCompetencesSchema>;
