import { requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

export const loanSchema = z.object({
  worker_id: requiredStringId("El trabajador es requerido"),
  delivery_date: z.string().optional().nullable(),
  reason: z
    .string()
    .max(255, "El motivo no puede tener más de 255 caracteres")
    .optional()
    .nullable(),
  payment_start: z.string().optional().nullable(),
  payment_days: z
    .array(z.number().int().min(1).max(31))
    .optional()
    .nullable(),
  loan_amount: z.coerce
    .number()
    .min(0.01, "El monto del préstamo debe ser mayor a 0"),
  installments_count: z.coerce
    .number()
    .int("El número de cuotas debe ser entero")
    .min(1, "Debe tener al menos 1 cuota")
    .optional()
    .nullable(),
  installment_amount: z.coerce
    .number()
    .min(0.01, "El monto de cuota debe ser mayor a 0"),
  status: z.boolean().optional().nullable(),
});

export type LoanSchema = z.infer<typeof loanSchema>;
