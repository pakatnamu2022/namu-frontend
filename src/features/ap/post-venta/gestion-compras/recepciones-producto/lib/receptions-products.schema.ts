import { requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

const receptionDetailSchema = z.object({
  purchase_order_item_id: z.string().optional(),
  product_id: requiredStringId("Producto es requerido"),
  quantity_received: z
    .number()
    .min(0.01, { message: "La cantidad recibida debe ser mayor a 0" }),
  quantity_accepted: z
    .number()
    .min(0, { message: "La cantidad aceptada debe ser mayor o igual a 0" }),
  quantity_rejected: z
    .number()
    .min(0, { message: "La cantidad rechazada debe ser mayor o igual a 0" })
    .optional(),
  reception_type: z.enum(["ORDERED", "BONUS", "GIFT", "SAMPLE"], {
    message: "Tipo de recepción inválido",
  }),
  unit_cost: z
    .number()
    .min(0, { message: "El costo unitario debe ser mayor o igual a 0" })
    .optional(),
  is_charged: z.boolean().optional(),
  rejection_reason: z
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
  rejection_notes: z.string().optional(),
  bonus_reason: z
    .string()
    .max(255, { message: "Máximo 255 caracteres" })
    .optional(),
  batch_number: z
    .string()
    .max(100, { message: "Máximo 100 caracteres" })
    .optional(),
  expiration_date: z.string().optional(),
  notes: z.string().optional(),
});

const receptionSchemaBase = z.object({
  purchase_order_id: requiredStringId("Orden de compra es requerida"),
  reception_date: z.string().refine((value) => value.trim() !== "", {
    message: "Fecha de recepción es requerida",
  }),
  warehouse_id: requiredStringId("Almacén es requerido"),
  supplier_invoice_number: z
    .string()
    .max(100, { message: "Máximo 100 caracteres" })
    .optional(),
  supplier_invoice_date: z.string().optional(),
  shipping_guide_number: z
    .string()
    .max(100, { message: "Máximo 100 caracteres" })
    .optional(),
  notes: z.string().optional(),
  received_by: z.string().optional(),
  details: z
    .array(receptionDetailSchema)
    .min(1, { message: "Debe agregar al menos un producto" }),
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
