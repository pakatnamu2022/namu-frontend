import { requiredStringId } from "@/shared/lib/global.schema.ts";
import { z } from "zod";

const supplierOrderDetailItemSchema = z.object({
  product_id: requiredStringId("Producto es requerido"),
  unit_measurement_id: requiredStringId("Unidad de medida es requerida"),
  quantity: z.number().min(0.01, { message: "La cantidad debe ser mayor a 0" }),
  unit_price: z
    .number()
    .min(0, { message: "El precio unitario debe ser mayor o igual a 0" }),
  total: z.number().min(0, { message: "El total debe ser mayor o igual a 0" }),
  note: z.string().optional(),
});

const supplierOrderSchemaBase = z.object({
  order_number: z.string().min(1, { message: "Número de pedído es requerido" }),
  supplier_id: requiredStringId("Proveedor es requerido"),
  sede_id: requiredStringId("Sede es requerida"),
  warehouse_id: requiredStringId("Almacén es requerido"),
  type_currency_id: requiredStringId("Tipo de moneda es requerida"),
  order_date: z.union([z.literal(""), z.date()]),
  supply_type: z.enum(["STOCK", "LIMA", "IMPORTACION"], {
    message: "Tipo de abastecimiento inválido",
  }),
  details: z
    .array(supplierOrderDetailItemSchema)
    .min(1, { message: "Debe actualizar al menos un producto" }),
});

export const supplierOrderSchemaCreate = supplierOrderSchemaBase;

export const supplierOrderSchemaUpdate = supplierOrderSchemaBase.partial();

export type SupplierOrderSchema = z.infer<typeof supplierOrderSchemaCreate>;

export type SupplierOrderDetailItemSchema = z.infer<
  typeof supplierOrderDetailItemSchema
>;

export function validateSupplierOrderFormData(data: any): SupplierOrderSchema {
  return supplierOrderSchemaCreate.parse(data);
}

export function validateSupplierOrderUpdateFormData(
  data: any
): Partial<SupplierOrderSchema> {
  return supplierOrderSchemaUpdate.parse(data);
}
