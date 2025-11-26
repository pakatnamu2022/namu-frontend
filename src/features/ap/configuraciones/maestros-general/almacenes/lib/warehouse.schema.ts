import { z } from "zod";

export const warehouseSchemaCreate = z
  .object({
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
    inventory_account: z.string().max(100).optional(),
    counterparty_account: z.string().max(100).optional(),
    type_operation_id: z.string().optional(),
    sede_id: z.string().optional(),
    article_class_id: z.string().optional(),
    parent_warehouse_id: z.string().optional(),
    is_physical_warehouse: z.boolean().default(false),
    is_received: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    // Si es almacén padre (is_physical_warehouse = true)
    if (data.is_physical_warehouse) {
      // Solo requiere: dyn_code, description, sede_id, type_operation_id
      if (!data.sede_id || data.sede_id.trim() === "") {
        ctx.addIssue({
          code: "custom",
          message: "Sede es requerido",
          path: ["sede_id"],
        });
      }
      if (!data.type_operation_id || data.type_operation_id.trim() === "") {
        ctx.addIssue({
          code: "custom",
          message: "Tipo de Operación es requerido",
          path: ["type_operation_id"],
        });
      }
    } else {
      // Si NO es almacén padre, requiere todos los campos excepto parent_warehouse_id que es opcional
      if (!data.inventory_account || data.inventory_account.trim() === "") {
        ctx.addIssue({
          code: "custom",
          message: "Cuenta de Inventario es requerido",
          path: ["inventory_account"],
        });
      }
      if (
        !data.counterparty_account ||
        data.counterparty_account.trim() === ""
      ) {
        ctx.addIssue({
          code: "custom",
          message: "Cuenta de Contrapartida es requerido",
          path: ["counterparty_account"],
        });
      }
      if (!data.sede_id || data.sede_id.trim() === "") {
        ctx.addIssue({
          code: "custom",
          message: "Sede es requerido",
          path: ["sede_id"],
        });
      }
      if (!data.type_operation_id || data.type_operation_id.trim() === "") {
        ctx.addIssue({
          code: "custom",
          message: "Tipo de Operación es requerido",
          path: ["type_operation_id"],
        });
      }
      if (!data.article_class_id || data.article_class_id.trim() === "") {
        ctx.addIssue({
          code: "custom",
          message: "Clase de Artículo es requerido",
          path: ["article_class_id"],
        });
      }
    }
  });

export const warehouseSchemaUpdate = warehouseSchemaCreate.partial();

export type WarehouseSchema = z.infer<typeof warehouseSchemaCreate>;
