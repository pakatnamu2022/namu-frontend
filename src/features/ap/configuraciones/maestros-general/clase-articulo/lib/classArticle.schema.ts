import { requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

export const classArticleSchemaCreate = z.object({
  dyn_code: z
    .string()
    .max(50)
    .refine((value) => value.trim() !== "", {
      message: "Código es requerido",
    }),
  description: z
    .string()
    .max(255)
    .refine((value) => value.trim() !== "", {
      message: "Descripción es requerida",
    }),
  account: z
    .string()
    .max(150)
    .refine((value) => value.trim() !== "", {
      message: "Cuenta es requerida",
    }),
  type_operation_id: requiredStringId("Tipo de Operación es requerido"),
  status: z.boolean().optional().default(true),
});

export const classArticleSchemaUpdate = classArticleSchemaCreate.partial();

export type ClassArticleSchema = z.infer<typeof classArticleSchemaCreate>;
