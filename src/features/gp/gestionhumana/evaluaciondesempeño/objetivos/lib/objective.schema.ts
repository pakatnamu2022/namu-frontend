import { requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

export const objectiveSchemaCreate = z.object({
  name: z.string().max(1000).min(1, "El nombre es obligatorio"), // nombre obligatorio
  description: z.string().max(1000).min(1, "La descripción es obligatoria"), // descripción obligatoria
  metric_id: requiredStringId("Selecciona una métrica"), // ID de la métrica, requerido
});

export const objectiveSchemaUpdate = objectiveSchemaCreate.partial();

export type ObjectiveSchema = z.infer<typeof objectiveSchemaCreate>;
