import { requiredStringId } from "@/shared/lib/global.schema.ts";
import { z } from "zod";

export const productShelfSchemaCreate = z.object({
  warehouse_id: requiredStringId("Almacén es requerido"),
  label: z
    .string()
    .max(150, { message: "Máximo 150 caracteres" })
    .refine((value) => value.trim() !== "", {
      message: "Nombre del estante es requerido",
    }),
  notes: z
    .string()
    .max(500, { message: "Máximo 500 caracteres" })
    .optional()
    .or(z.literal("")),
  status: z.boolean().optional().default(true),
});

export const productShelfSchemaUpdate = productShelfSchemaCreate.partial();

export type ProductShelfSchema = z.infer<typeof productShelfSchemaCreate>;

// ─── Asignar productos ───────────────────────────────────────────────────────

const assignShelfProductItemSchema = z.object({
  product_warehouse_stock_id: requiredStringId("Producto es requerido"),
  position: z
    .string()
    .max(50, { message: "Máximo 50 caracteres" })
    .optional()
    .or(z.literal("")),
});

export const assignShelfProductsSchema = z.object({
  products: z
    .array(assignShelfProductItemSchema)
    .min(1, { message: "Debe agregar al menos un producto" }),
});

export type AssignShelfProductsSchema = z.infer<
  typeof assignShelfProductsSchema
>;
