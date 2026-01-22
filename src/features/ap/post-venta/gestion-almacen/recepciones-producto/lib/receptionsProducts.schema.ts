import { requiredStringId } from "@/shared/lib/global.schema.ts";
import { z } from "zod";

const receptionDetailSchema = z.object({
  purchase_order_item_id: z.string().optional(),
  product_id: requiredStringId("Producto es requerido"),
  quantity_received: z
    .number()
    .min(0.01, { message: "La cantidad recibida debe ser mayor a 0" }),
  observed_quantity: z
    .number()
    .min(0, { message: "La cantidad observada debe ser mayor o igual a 0" })
    .optional(),
  reception_type: z.enum(["ORDERED", "BONUS", "GIFT", "SAMPLE"], {
    message: "Tipo de recepción inválido",
  }),
  reason_observation: z
    .enum([
      "DAMAGED",
      "DEFECTIVE",
      "EXPIRED",
      "WRONG_PRODUCT",
      "WRONG_QUANTITY",
      "POOR_QUALITY",
      "OTHER",
    ])
    .optional(),
  observation_notes: z.string().optional(),
  bonus_reason: z
    .string()
    .max(255, { message: "Máximo 255 caracteres" })
    .optional(),
  notes: z.string().optional(),
});

const receptionSchemaBase = z.object({
  purchase_order_id: requiredStringId("Orden de compra es requerida"),
  reception_date: z.date({ message: "Fecha de recepción es requerida" }),
  warehouse_id: requiredStringId("Almacén es requerido"),
  shipping_guide_number: z
    .string()
    .max(100, { message: "Máximo 100 caracteres" })
    .optional()
    .or(z.literal("")),
  freight_cost: z
    .number({ message: "Costo de flete es requerido" })
    .min(0, { message: "El costo de flete debe ser mayor o igual a 0" }),
  notes: z.string().optional().or(z.literal("")),
  carrier_id: requiredStringId("Transportista es requerido"),
  details: z
    .array(receptionDetailSchema)
    .min(1, { message: "Debe actualizar al menos un producto" }),
});

export const receptionSchemaCreate = receptionSchemaBase;

export const receptionSchemaUpdate = receptionSchemaBase.partial();

export type ReceptionSchema = z.infer<typeof receptionSchemaCreate>;

export type ReceptionDetailSchema = z.infer<typeof receptionDetailSchema>;

export function validateReceptionFormData(data: any): ReceptionSchema {
  return receptionSchemaCreate.parse(data);
}

export function validateReceptionUpdateFormData(
  data: any
): Partial<ReceptionSchema> {
  return receptionSchemaUpdate.parse(data);
}
