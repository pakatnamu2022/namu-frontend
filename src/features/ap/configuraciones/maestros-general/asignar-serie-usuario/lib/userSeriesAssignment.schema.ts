import { requiredStringId } from "@/src/shared/lib/global.schema";
import { z } from "zod";

export const userSeriesAssignmentSchemaCreate = z.object({
  worker_id: requiredStringId("Trabajador es requerido"),
  vouchers: z
    .array(
      z.object({
        id: z.number().int().positive(),
        series: z.string().min(1, "La Serie es requerida"),
        sede: z.string().min(1, "La Sede es requerida"),
        type_receipt: z.string().min(1, "El Tipo de Comprobante es requerido"),
        type_operation: z.string().min(1, "El Tipo de Operación es requerido"),
      })
    )
    .min(1, { message: "Debe seleccionar al menos un Comprobante" }),
});

export const userSeriesAssignmentSchemaUpdate =
  userSeriesAssignmentSchemaCreate.partial();

export type UserSeriesAssignmentSchema = z.infer<
  typeof userSeriesAssignmentSchemaCreate
>;
