import { requiredNumber, requiredText } from "@/shared/lib/global.schema";
import { z } from "zod";

export const unitMeasurementSchemaCreate = z.object({
  dyn_code: requiredText("Código Dyn es requerido", 1, 3),
  nubefac_code: requiredText("Código Nubefac es requerido", 1, 3),
  description: requiredText("Descripción es requerida", 1, 50),
  number_decimals: requiredNumber("Número de decimales es requerido"),
  status: z.boolean().optional().default(true),
});

export const unitMeasurementSchemaUpdate =
  unitMeasurementSchemaCreate.partial();

export type UnitMeasurementSchema = z.infer<typeof unitMeasurementSchemaCreate>;
