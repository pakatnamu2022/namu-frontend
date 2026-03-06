import { requiredDate } from "@/shared/lib/global.schema";
import { z } from "zod";

export const payrollPeriodSchemaCreate = z.object({
  year: z.coerce
    .number()
    .min(2000, "El año debe ser mayor a 2000")
    .max(2100, "El año debe ser menor a 2100"),
  month: z.coerce.number().min(1, "Mes inválido").max(12, "Mes inválido"),
  payment_date: requiredDate("La fecha de pago es requerida"),
  company_id: z.coerce.number().min(1, "La empresa es requerida"),
});

export const payrollPeriodSchemaUpdate = payrollPeriodSchemaCreate.partial();

export type PayrollPeriodSchema = z.infer<typeof payrollPeriodSchemaCreate>;
