import { requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

const purchaseOrderProductItemSchema = z.object({
  product_id: requiredStringId("Producto es requerido"),
  quantity: z.number().min(1, { message: "La cantidad debe ser mayor a 0" }),
  unit_price: z
    .number()
    .min(0, { message: "El precio unitario debe ser mayor o igual a 0" }),
  discount: z
    .number()
    .min(0, { message: "El descuento debe ser mayor o igual a 0" })
    .max(100, { message: "El descuento no puede ser mayor a 100" })
    .optional(),
  tax_rate: z
    .number()
    .min(0, { message: "La tasa de impuesto debe ser mayor o igual a 0" })
    .max(100, { message: "La tasa de impuesto no puede ser mayor a 100" })
    .optional(),
  notes: z.string().optional(),
});

const purchaseOrderProductsSchemaBase = z.object({
  order_number: z
    .string()
    .max(50, { message: "M�ximo 50 caracteres" })
    .refine((value) => value.trim() !== "", {
      message: "Nmero de orden es requerido",
    }),
  supplier_id: requiredStringId("Proveedor es requerido"),
  order_date: z.string().refine((value) => value.trim() !== "", {
    message: "Fecha de orden es requerida",
  }),
  expected_delivery_date: z.union([z.literal(""), z.date()]).optional(),
  payment_terms: z.string().optional(),
  shipping_method: z.string().optional(),
  warehouse_id: z.string().optional(),
  currency_type_id: z.string().optional(),
  subtotal: z
    .number()
    .min(0, { message: "El subtotal debe ser mayor o igual a 0" }),
  total_discount: z
    .number()
    .min(0, { message: "El descuento total debe ser mayor o igual a 0" })
    .optional(),
  total_tax: z
    .number()
    .min(0, { message: "El impuesto total debe ser mayor o igual a 0" })
    .optional(),
  total_amount: z
    .number()
    .min(0, { message: "El monto total debe ser mayor o igual a 0" }),
  status: z.enum(["PENDING", "APPROVED", "RECEIVED", "CANCELLED"], {
    message: "Estado inv�lido",
  }),
  notes: z.string().optional(),
  items: z
    .array(purchaseOrderProductItemSchema)
    .min(1, { message: "Debe agregar al menos un producto" }),
});

export const purchaseOrderProductsSchemaCreate =
  purchaseOrderProductsSchemaBase;

export const purchaseOrderProductsSchemaUpdate =
  purchaseOrderProductsSchemaBase.partial();

export type PurchaseOrderProductsSchema = z.infer<
  typeof purchaseOrderProductsSchemaCreate
>;

export type PurchaseOrderProductItemSchema = z.infer<
  typeof purchaseOrderProductItemSchema
>;

export function validatePurchaseOrderProductsFormData(
  data: any
): PurchaseOrderProductsSchema {
  return purchaseOrderProductsSchemaCreate.parse(data);
}

export function validatePurchaseOrderProductsUpdateFormData(
  data: any
): Partial<PurchaseOrderProductsSchema> {
  return purchaseOrderProductsSchemaUpdate.parse(data);
}
