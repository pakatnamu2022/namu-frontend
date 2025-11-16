import { requiredStringId } from "@/src/shared/lib/global.schema";
import { z } from "zod";

export const approvedAccesoriesSchemaCreate = z.object({
  code: z
    .string()
    .max(50)
    .refine((value) => value.trim() !== "", {
      message: "Código es requerido",
    }),
  type: z
    .string()
    .max(100)
    .refine((value) => value.trim() !== "", {
      message: "Tipo es requerido",
    }),
  description: z
    .string()
    .max(255)
    .refine((value) => value.trim() !== "", {
      message: "Descripción es requerida",
    }),
  price: z.coerce.number().min(0, { message: "El precio debe ser mayor o igual a 0" }),
  type_currency_id: requiredStringId("Tipo de moneda es requerida"),
  body_type_id: requiredStringId("Tipo de carrocería es requerida"),
});

export const approvedAccesoriesSchemaUpdate =
  approvedAccesoriesSchemaCreate.partial();

export type ApprovedAccesoriesSchema = z.infer<
  typeof approvedAccesoriesSchemaCreate
>;
