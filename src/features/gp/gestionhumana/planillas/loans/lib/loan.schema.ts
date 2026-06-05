import {
  requiredDate,
  requiredDecimalNumber,
  requiredNumber,
  requiredStringId,
  requiredText,
} from "@/shared/lib/global.schema";
import { z } from "zod";

export const loanSchema = z.object({
  worker_id: requiredStringId("El trabajador es requerido"),
  delivery_date: requiredDate("La fecha de entrega es requerida"),
  reason: requiredText("La razón del préstamo es requerida", 3, 250),
  payment_start: requiredDate("La fecha de inicio de pago es requerida"),
  payment_days: z.array(z.number().int().min(1).max(31)).optional().nullable(),
  loan_amount: requiredDecimalNumber(
    "El monto del préstamo es requerido y debe ser mayor a 0",
  ),
  installments_count: requiredNumber(
    "El número de cuotas es requerido y debe ser un entero mayor a 0",
  ),
  installment_amount: requiredDecimalNumber(
    "El monto de la cuota es requerido y debe ser mayor a 0",
  ),
});

export type LoanSchema = z.infer<typeof loanSchema>;
