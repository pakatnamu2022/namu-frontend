import { requiredText } from "@/shared/lib/global.schema";
import { z } from "zod";

export const gpMastersSchemaCreate = z.object({
  code: requiredText("Código es requerido", 1, 50),
  description: requiredText("Descripción es requerida", 1, 255),
  type: requiredText("Tipo es requerido", 1, 100),
  status: z.boolean().optional().default(true),
});

export const gpMastersSchemaUpdate = gpMastersSchemaCreate.partial();

export type ApMastersSchema = z.infer<typeof gpMastersSchemaCreate>;
