import { requiredDate, requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

// Schema para los detalles de la solicitud
export const purchaseRequestDetailSchema = z.object({
  product_id: requiredStringId("Producto es requerido"),
  quantity: z.number().min(0.01, "La cantidad debe ser mayor a 0"),
  notes: z.string().optional(),
  product_name: z.string().optional(), // Solo para UI
  product_code: z.string().optional(), // Solo para UI
});

export const purchaseRequestSchemaCreate = z.object({
  ap_order_quotation_id: z.string().optional(),
  warehouse_id: requiredStringId("Almacén es requerido"),
  requested_date: requiredDate("Fecha solicitada es requerida"),
  observations: z.string().optional(),
  has_appointment: z.boolean().optional(),
  supply_type: z.enum(["STOCK", "LIMA", "IMPORTACION"]),
  details: z
    .array(purchaseRequestDetailSchema)
    .min(1, "Debe actualizar al menos un producto"),
});

export const purchaseRequestSchemaUpdate =
  purchaseRequestSchemaCreate.partial();

export type PurchaseRequestSchema = z.infer<typeof purchaseRequestSchemaCreate>;

export type PurchaseRequestDetailSchema = z.infer<
  typeof purchaseRequestDetailSchema
>;
