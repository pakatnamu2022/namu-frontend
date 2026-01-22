import { requiredDate, requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

// Schema para los detalles de productos
export const productDetailMesonSchema = z.object({
  product_id: requiredStringId("Producto es requerido"),
  description: z.string().min(1, "Descripción es requerida").max(255),
  quantity: z.number().min(0.01, "Cantidad debe ser mayor a 0"),
  unit_measure: z.string().min(1, "Unidad de medida es requerida").max(50),
  unit_price: z.number().min(0, "Precio debe ser mayor o igual a 0"),
  discount_percentage: z
    .number()
    .min(0, "Descuento debe ser mayor o igual a 0")
    .max(100, "Descuento no puede ser mayor a 100")
    .default(0),
  total_amount: z.number().min(0, "Total debe ser mayor o igual a 0"),
  observations: z.string().max(500).optional(),
  retail_price_external: z
    .number()
    .min(0, "Precio externo debe ser mayor o igual a 0")
    .optional(),
  exchange_rate: z
    .number()
    .min(0, "Tipo de cambio debe ser mayor o igual a 0")
    .optional(),
  freight_commission: z
    .number()
    .min(0, "Comisión de flete debe ser mayor o igual a 0")
    .optional(),
});

// Schema para crear cotización con productos
export const quotationMesonWithProductsSchemaCreate = z.object({
  // Campos de la cotización
  area_id: requiredStringId("Área es requerida"),
  client_id: requiredStringId("Cliente es requerido"),
  vehicle_id: z.string().optional(),
  sede_id: requiredStringId("Sede es requerida"),
  currency_id: requiredStringId("Moneda es requerida"),
  quotation_date: requiredDate("Fecha de cotización es requerida"),
  expiration_date: requiredDate("Fecha de expiración es requerida"),
  collection_date: requiredDate("Fecha de recojo es requerida"),
  observations: z.string().min(0).max(500).optional(),
  supply_type: z.enum(["STOCK", "LIMA", "IMPORTACION"]),

  // Array de detalles de productos
  details: z
    .array(productDetailMesonSchema)
    .min(1, "Debe actualizar al menos un producto"),
});

export const quotationMesonWithProductsSchemaUpdate =
  quotationMesonWithProductsSchemaCreate.partial();

export type ProductDetailMesonSchema = z.infer<typeof productDetailMesonSchema>;
export type QuotationMesonWithProductsSchema = z.infer<
  typeof quotationMesonWithProductsSchemaCreate
>;
