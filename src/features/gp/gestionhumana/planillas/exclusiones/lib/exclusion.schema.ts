import { optionalStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

export const exclusionSchemaCreate = z.object({
  worker_id: optionalStringId("El trabajador es obligatorio"),
  period_id: optionalStringId("El periodo es obligatorio"),
  concept: optionalStringId("El concepto es obligatorio"),
  reason: z
    .string()
    .max(255, "El motivo no puede exceder 255 caracteres")
    .optional()
    .or(z.literal("")),
});

export type ExclusionCreateSchema = z.infer<typeof exclusionSchemaCreate>;
