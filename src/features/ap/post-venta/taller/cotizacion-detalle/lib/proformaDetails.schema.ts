import { requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

// Schema para mano de obra
export const laborDetailSchema = z.object({
  order_quotation_id: z.number(),
  item_type: z.literal("LABOR"),
  description: z.string().min(1, "Descripción es requerida").max(500),
  quantity: z.number().min(0.1, "Cantidad debe ser mayor a 0"),
  unit_measure: z.string().min(1, "Unidad de medida es requerida"),
  unit_price: z.number().min(0, "Precio debe ser mayor o igual a 0"),
  discount: z
    .number()
    .min(0, "Descuento debe ser mayor o igual a 0")
    .default(0),
  total_amount: z.number().min(0, "Total debe ser mayor o igual a 0"),
  exchange_rate: z.number().min(0, "Tipo de cambio debe ser mayor o igual a 0"),
  observations: z.string().max(500).optional(),
});

// Schema para productos
export const productDetailSchema = z.object({
  order_quotation_id: z.number(),
  item_type: z.literal("PRODUCT"),
  product_id: requiredStringId("Producto es requerido"),
  description: z.string().min(1).max(500),
  quantity: z.number().min(0.1, "Cantidad debe ser mayor a 0"),
  unit_measure: z.string().min(1),
  retail_price_external: z
    .number()
    .min(0, "Precio externo debe ser mayor o igual a 0"),
  freight_commission: z
    .number()
    .min(0, "Comisión de flete debe ser mayor o igual a 0")
    .default(1.05),
  exchange_rate: z.number().min(0, "Tipo de cambio debe ser mayor o igual a 0"),
  unit_price: z.number().min(0),
  discount: z
    .number()
    .min(0, "Descuento debe ser mayor o igual a 0")
    .default(0),
  total_amount: z.number().min(0, "Total debe ser mayor o igual a 0"),
  observations: z.string().max(500).optional(),
});

export type LaborDetailSchema = z.infer<typeof laborDetailSchema>;
export type ProductDetailSchema = z.infer<typeof productDetailSchema>;
