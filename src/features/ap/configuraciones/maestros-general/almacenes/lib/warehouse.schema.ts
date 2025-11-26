import { requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

export const warehouseSchemaCreate = z.object({
  dyn_code: z
    .string()
    .max(100)
    .refine((value) => value.trim() !== "", {
      message: "Cod. Dynamic es requerido",
    }),
  description: z
    .string()
    .max(100)
    .refine((value) => value.trim() !== "", {
      message: "Descripción es requerido",
    }),
  inventory_account: z
    .string()
    .max(100)
    .refine((value) => value.trim() !== "", {
      message: "Cuenta de Inventario es requerido",
    }),
  counterparty_account: z
    .string()
    .max(100)
    .refine((value) => value.trim() !== "", {
      message: "Cuenta de Contrapartida es requerido",
    }),
  type_operation_id: requiredStringId("Tipo de Operación es requerido"),
  sede_id: requiredStringId("Sede es requerido"),
  article_class_id: requiredStringId("Clase de Artículo es requerido"),
  parent_warehouse_id: z.string().optional(),
  is_physical_warehouse: z.boolean().default(false),
  is_received: z.boolean().default(true),
});

export const warehouseSchemaUpdate = warehouseSchemaCreate.partial();

export type WarehouseSchema = z.infer<typeof warehouseSchemaCreate>;
