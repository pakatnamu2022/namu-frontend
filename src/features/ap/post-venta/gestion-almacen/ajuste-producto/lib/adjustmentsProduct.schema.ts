import { AP_MASTER_TYPE } from "@/features/ap/ap-master/lib/apMaster.constants.ts";
import { requiredStringId } from "@/shared/lib/global.schema.ts";
import { z } from "zod";

const adjustmentDetailSchema = z.object({
  product_id: requiredStringId("Producto es requerido"),
  quantity: z.coerce
    .number()
    .min(0.01, { message: "La cantidad debe ser mayor a 0" }),
  unit_cost: z.coerce
    .number()
    .min(0, { message: "El costo unitario debe ser mayor o igual a 0" })
    .optional(),
  batch_number: z
    .string()
    .max(100, { message: "Máximo 100 caracteres" })
    .optional()
    .or(z.literal("")),
  expiration_date: z.union([z.literal(""), z.date()]).optional(),
  notes: z
    .string()
    .max(500, { message: "Máximo 500 caracteres" })
    .optional()
    .or(z.literal("")),
});

const adjustmentSchemaBase = z.object({
  movement_type: z.enum(
    [AP_MASTER_TYPE.TYPE_ADJUSTMENT_IN, AP_MASTER_TYPE.TYPE_ADJUSTMENT_OUT],
    {
      message: "Tipo de movimiento inválido",
    }
  ),
  reason_in_out_id: requiredStringId("Motivo de ajuste es requerido"),
  warehouse_id: requiredStringId("Almacén es requerido"),
  movement_date: z.union([z.literal(""), z.date()]),
  notes: z
    .string()
    .max(1000, { message: "Máximo 1000 caracteres" })
    .optional()
    .or(z.literal("")),
  details: z
    .array(adjustmentDetailSchema)
    .min(1, { message: "Debe actualizar al menos un producto" }),
});

export const adjustmentSchemaCreate = adjustmentSchemaBase;

export const adjustmentSchemaUpdate = adjustmentSchemaBase.partial();

export type AdjustmentSchema = z.infer<typeof adjustmentSchemaCreate>;

export type AdjustmentDetailSchema = z.infer<typeof adjustmentDetailSchema>;

export function validateAdjustmentFormData(data: any): AdjustmentSchema {
  return adjustmentSchemaCreate.parse(data);
}

export function validateAdjustmentUpdateFormData(
  data: any
): Partial<AdjustmentSchema> {
  return adjustmentSchemaUpdate.parse(data);
}
