import {
  requiredDecimalNumber,
  requiredStringId,
} from "@/shared/lib/global.schema";
import { z } from "zod";

export const inventoryStockMinMaxSchema = z.object({
  minimum_stock: requiredDecimalNumber("Stock mínimo es requerido"),
  maximum_stock: requiredDecimalNumber("Stock máximo es requerido"),
  product_id: requiredStringId("ID de producto es requerido"),
  warehouse_id: requiredStringId("ID de almacén es requerido"),
});

export const inventoryStockMinMaxSchemaUpdate =
  inventoryStockMinMaxSchema.partial();

export type InventoryStockMinMaxSchema = z.infer<
  typeof inventoryStockMinMaxSchema
>;
