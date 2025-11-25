import { requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

export const parentWarehouseSchemaCreate = z.object({
  dyn_code: z
    .string()
    .max(100)
    .refine((value) => value.trim() !== "", {
      message: "Cod. Dynamic es requerido",
    }),
  type_operation_id: requiredStringId("Tipo de Operación es requerido"),
  sede_id: requiredStringId("Sede es requerido"),
  is_received: z.boolean().default(true),
});

export const parentWarehouseSchemaUpdate =
  parentWarehouseSchemaCreate.partial();

export type ParentWarehouseSchema = z.infer<typeof parentWarehouseSchemaCreate>;
