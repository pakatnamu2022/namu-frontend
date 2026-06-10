import {
  requiredDate,
  requiredDecimalNumber,
  requiredStringId,
} from "@/shared/lib/global.schema.ts";
import { z } from "zod";

const supplierOrderDetailItemSchema = z.object({
  product_id: requiredStringId("Producto es requerido"),
  unit_measurement_id: z.string().optional(),
  quantity: requiredDecimalNumber("La cantidad debe ser mayor a 0"),
  unit_price: requiredDecimalNumber("El precio unitario debe ser mayor a 0"),
  total: requiredDecimalNumber("El total debe ser mayor a 0"),
  note: z.string().optional(),
});

const supplierOrderSchemaBase = z.object({
  order_number_external: z.string().nullable().optional(),
  supplier_id: requiredStringId("Proveedor es requerido"),
  warehouse_id: requiredStringId("Almacén es requerido"),
  type_currency_id: requiredStringId("Tipo de moneda es requerida"),
  order_date: requiredDate("Fecha de pedido es requerida"),
  supply_type: z.enum(["STOCK", "CENTRAL", "IMPORTACION", "LOCAL"], {
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
  data: any,
): Partial<SupplierOrderSchema> {
  return supplierOrderSchemaUpdate.parse(data);
}
