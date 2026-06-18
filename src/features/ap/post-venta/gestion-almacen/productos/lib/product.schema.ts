import { requiredStringId, requiredText } from "@/shared/lib/global.schema.ts";
import { z } from "zod";

// Warehouse stock schema for create mode
const warehouseStockSchema = z.object({
  warehouse_id: requiredStringId("Almacén es requerido"),
  minimum_stock: z
    .number()
    .min(0, { message: "El stock mínimo debe ser mayor o igual a 0" })
    .optional(),
  maximum_stock: z
    .number()
    .min(0, { message: "El stock máximo debe ser mayor o igual a 0" })
    .optional(),
});

// Base schema for common fields
const productSchemaBase = z.object({
  code: requiredText("Código es requerido", 3, 50),
  dyn_code: z.string().max(50, { message: "Máximo 50 caracteres" }).optional(),
  name: requiredText("Nombre es requerido", 3, 255),
  description: z.string().optional().nullable(),
  product_category_id: requiredStringId("Categoría es requerida"),
  brand_id: z.string().optional(),
  unit_measurement_id: requiredStringId("Unidad de medida es requerida"),
  ap_class_article_id: requiredStringId("Clase de artículo es requerida"),
  warranty_months: z
    .number()
    .min(0, { message: "El stock máximo debe ser mayor o igual a 0" })
    .optional(),
});

// Create schema includes warehouses array
export const productSchemaCreate = productSchemaBase.extend({
  warehouses: z.array(warehouseStockSchema).optional(),
});

// Update schema does NOT include warehouses (warehouse management happens elsewhere)
export const productSchemaUpdate = productSchemaBase.partial();

export type ProductSchema = z.infer<typeof productSchemaCreate>;

// Helper para validar FormData antes del envío
export function validateProductFormData(data: any): ProductSchema {
  return productSchemaCreate.parse(data);
}

export function validateProductUpdateFormData(
  data: any,
): Partial<ProductSchema> {
  return productSchemaUpdate.parse(data);
}
