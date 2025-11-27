import { requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

const transferReceptionDetailSchema = z.object({
  transfer_item_id: z.string().optional(),
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

const transferReceptionSchemaBase = z.object({
  product_transfer_id: requiredStringId("Transferencia de producto es requerida"),
  reception_date: z.date({ message: "Fecha de recepción es requerida" }),
  warehouse_id: requiredStringId("Almacén es requerido"),
  shipping_guide_number: z
    .string()
    .max(100, { message: "Máximo 100 caracteres" })
    .optional()
    .or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  details: z
    .array(transferReceptionDetailSchema)
    .min(1, { message: "Debe agregar al menos un producto" }),
});

export const transferReceptionSchemaCreate = transferReceptionSchemaBase;

export const transferReceptionSchemaUpdate = transferReceptionSchemaBase.partial();

export type TransferReceptionSchema = z.infer<typeof transferReceptionSchemaCreate>;

export type TransferReceptionDetailSchema = z.infer<typeof transferReceptionDetailSchema>;

export function validateTransferReceptionFormData(data: any): TransferReceptionSchema {
  return transferReceptionSchemaCreate.parse(data);
}

export function validateTransferReceptionUpdateFormData(
  data: any
): Partial<TransferReceptionSchema> {
  return transferReceptionSchemaUpdate.parse(data);
}
