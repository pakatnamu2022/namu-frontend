import { requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

export const modelsVnPvSchemaCreate = z.object({
  version: z
    .string()
    .max(50)
    .refine((value) => value.trim() !== "", {
      message: "Versión es requerido",
    }),

  brand_id: requiredStringId("Marca es requerida"),
  family_id: requiredStringId("Familia es requerida"),
  type_operation_id: z.string().optional(),
});

export const modelsVnPvSchemaUpdate = modelsVnPvSchemaCreate.partial();

export type ModelsVnPvSchema = z.infer<typeof modelsVnPvSchemaCreate>;
