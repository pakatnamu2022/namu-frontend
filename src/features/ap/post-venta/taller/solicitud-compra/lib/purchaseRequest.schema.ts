import { requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

// Schema para los detalles de la solicitud
export const purchaseRequestDetailSchema = z.object({
  product_id: requiredStringId("Producto es requerido"),
  quantity: z.number().min(0.01, "La cantidad debe ser mayor a 0"),
  notes: z.string().optional(),
});

export const purchaseRequestSchemaCreate = z.object({
  ap_order_quotation_id: z.string().optional(),
  purchase_order_id: z.string().optional(),
  warehouse_id: requiredStringId("Almacén es requerido"),
  requested_date: z.union([z.literal(""), z.date()]),
  observations: z.string().min(0).max(500).optional(),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  has_appointment: z.boolean().optional(),
  details: z
    .array(purchaseRequestDetailSchema)
    .min(1, "Debe agregar al menos un producto"),
});

export const purchaseRequestSchemaUpdate =
  purchaseRequestSchemaCreate.partial();

export type PurchaseRequestSchema = z.infer<typeof purchaseRequestSchemaCreate>;

export type PurchaseRequestDetailSchema = z.infer<
  typeof purchaseRequestDetailSchema
>;
