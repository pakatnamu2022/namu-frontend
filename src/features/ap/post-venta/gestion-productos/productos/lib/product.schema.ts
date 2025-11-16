import { requiredStringId } from "@/src/shared/lib/global.schema";
import { z } from "zod";

const productSchemaBase = z.object({
  code: z
    .string()
    .max(50, { message: "Máximo 50 caracteres" })
    .refine((value) => value.trim() !== "", {
      message: "Código es requerido",
    }),
  dyn_code: z.string().max(50, { message: "Máximo 50 caracteres" }).optional(),
  nubefac_code: z
    .string()
    .max(50, { message: "Máximo 50 caracteres" })
    .optional(),
  name: z
    .string()
    .max(255, { message: "Máximo 255 caracteres" })
    .refine((value) => value.trim() !== "", {
      message: "Nombre es requerido",
    }),
  description: z.string().optional(),
  product_category_id: requiredStringId("Categoría es requerida"),
  brand_id: z.string().optional(),
  unit_measurement_id: requiredStringId("Unidad de medida es requerida"),
  warehouse_id: z.string().optional(),
  ap_class_article_id: requiredStringId("Clase de artículo es requerida"),
  product_type: z.enum(["GOOD", "SERVICE", "KIT"], {
    required_error: "Tipo de producto es requerido",
  }),
  minimum_stock: z.coerce
    .number()
    .min(0, { message: "El stock mínimo debe ser mayor o igual a 0" })
    .optional(),
  maximum_stock: z.coerce
    .number()
    .min(0, { message: "El stock máximo debe ser mayor o igual a 0" })
    .optional(),
  current_stock: z.coerce
    .number()
    .min(0, { message: "El stock actual debe ser mayor o igual a 0" })
    .optional(),
  cost_price: z.coerce
    .number()
    .min(0, { message: "El precio de costo debe ser mayor o igual a 0" })
    .optional(),
  sale_price: z.coerce
    .number()
    .min(0, { message: "El precio de venta debe ser mayor o igual a 0" }),
  tax_rate: z.coerce
    .number()
    .min(0, { message: "La tasa de impuesto debe ser mayor o igual a 0" })
    .max(100, { message: "La tasa de impuesto no puede ser mayor a 100" })
    .optional(),
  is_taxable: z.boolean().optional(),
  sunat_code: z
    .string()
    .max(20, { message: "Máximo 20 caracteres" })
    .optional(),
  warranty_months: z.coerce
    .number()
    .int({ message: "Debe ser un número entero" })
    .min(0, { message: "Los meses de garantía deben ser mayor o igual a 0" })
    .optional(),
});

export const productSchemaCreate = productSchemaBase.refine(
  (data) => {
    if (data.maximum_stock !== undefined && data.minimum_stock !== undefined) {
      return data.maximum_stock >= data.minimum_stock;
    }
    return true;
  },
  {
    message: "El stock máximo debe ser mayor o igual al stock mínimo",
    path: ["maximum_stock"],
  }
);

export const productSchemaUpdate = productSchemaBase.partial().refine(
  (data) => {
    if (data.maximum_stock !== undefined && data.minimum_stock !== undefined) {
      return data.maximum_stock >= data.minimum_stock;
    }
    return true;
  },
  {
    message: "El stock máximo debe ser mayor o igual al stock mínimo",
    path: ["maximum_stock"],
  }
);

export type ProductSchema = z.infer<typeof productSchemaCreate>;

// Helper para validar FormData antes del envío
export function validateProductFormData(data: any): ProductSchema {
  return productSchemaCreate.parse(data);
}

export function validateProductUpdateFormData(
  data: any
): Partial<ProductSchema> {
  return productSchemaUpdate.parse(data);
}
