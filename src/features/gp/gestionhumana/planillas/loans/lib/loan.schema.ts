import { z } from "zod";

export const loanSchema = z.object({
  concept_id: z.coerce.number().min(1, "El concepto es requerido"),
  worker_id: z.coerce.number().min(1, "El trabajador es requerido"),
  delivery_date: z.string().min(1, "La fecha de entrega es requerida"),
  reason: z
    .string()
    .min(1, "El motivo es requerido")
    .max(500, "El motivo no puede tener más de 500 caracteres"),
  payment_start: z.string().min(1, "La fecha de inicio de pago es requerida"),
  loan_amount: z.coerce
    .number()
    .min(0.01, "El monto del préstamo debe ser mayor a 0"),
  installments_count: z.coerce
    .number()
    .int("El número de cuotas debe ser entero")
    .min(1, "Debe tener al menos 1 cuota"),
  installment_amount: z.coerce
    .number()
    .min(0, "El monto de cuota debe ser mayor o igual a 0"),
  status: z.enum(["ACTIVO", "COMPLETADO", "ANULADO"]),
});

export type LoanSchema = z.infer<typeof loanSchema>;
