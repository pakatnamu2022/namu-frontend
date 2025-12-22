import { requiredNumber, requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

export const perDiemRateSchemaCreate = z.object({
  per_diem_policy_id: requiredStringId("Política de viáticos es requerida"),
  district_id: requiredStringId("Distrito es requerido"),
  expense_type_id: requiredStringId("Tipo de gasto es requerido"),
  per_diem_category_id: requiredStringId("Categoría de viático es requerida"),
  daily_amount: requiredNumber("Monto diario es requerido"),
});

export const perDiemRateSchemaUpdate = perDiemRateSchemaCreate.partial();

export type PerDiemRateSchema = z.infer<typeof perDiemRateSchemaCreate>;
