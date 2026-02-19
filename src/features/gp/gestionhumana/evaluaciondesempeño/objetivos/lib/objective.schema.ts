import { requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

export const objectiveSchemaCreate = z.object({
  name: z.string().max(1000).min(1, "El nombre es obligatorio"),
  description: z.string().max(1000).min(1, "La descripción es obligatoria"),
  metric_id: requiredStringId("Selecciona una métrica"),
  isAscending: z.boolean().default(true),
});

export const objectiveSchemaUpdate = objectiveSchemaCreate.partial();

export type ObjectiveSchema = z.infer<typeof objectiveSchemaCreate>;
