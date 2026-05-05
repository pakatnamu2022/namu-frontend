import { requiredStringId } from "@/shared/lib/global.schema.ts";
import { z } from "zod";

export const approvedAccesoriesSchemaCreate = z.object({
  code: z
    .string()
    .max(50)
    .refine((value) => value.trim() !== "", {
      message: "Código es requerido",
    }),
  type_operation_id: z.coerce
    .number()
    .min(1, { message: "Tipo de operación es requerido" }),
  description: z
    .string()
    .max(255)
    .refine((value) => value.trim() !== "", {
      message: "Descripción es requerida",
    }),
  price: z.coerce
    .number()
    .min(0, { message: "El precio debe ser mayor o igual a 0" }),
  body_type_id: requiredStringId("Tipo de carrocería es requerida"),
});

export const approvedAccesoriesSchemaUpdate =
  approvedAccesoriesSchemaCreate.partial();

export type ApprovedAccesoriesSchema = z.infer<
  typeof approvedAccesoriesSchemaCreate
>;
