import {
  requiredNumber,
  requiredStringId,
} from "@/src/shared/lib/global.schema";
import { z } from "zod";

export const assignSalesSeriesSchemaCreate = z.object({
  series: z
    .string()
    .max(100)
    .refine((value) => value.trim() !== "", {
      message: "Serie es requerido",
    }),
  correlative_start: requiredNumber("Correlativo Inicial"),
  type_receipt_id: requiredStringId("Tipo de Comprobante es requerido"),
  type_operation_id: requiredStringId("Tipo de Operación es requerido"),
  sede_id: requiredStringId("Sede es requerido"),
});

export const assignSalesSeriesSchemaUpdate =
  assignSalesSeriesSchemaCreate.partial();

export type AssignSalesSeriesSchema = z.infer<
  typeof assignSalesSeriesSchemaCreate
>;
