import { optionalStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

export const objectiveSchemaCreate = z.object({
  name: z.string().max(1000).min(1), // nombre obligatorio
  description: z.string().max(1000).optional(), // descripción opcional
  metric_id: optionalStringId("Selecciona una métrica"), // ID de la métrica, requerido
});

export const objectiveSchemaUpdate = objectiveSchemaCreate.partial();

export type ObjectiveSchema = z.infer<typeof objectiveSchemaCreate>;
