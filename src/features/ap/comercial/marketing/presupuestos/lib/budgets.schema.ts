import { requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

export const budgetsSchema = z.object({
  plan_id: requiredStringId("El plan es requerido"),
  type: z.string().min(1, "El tipo es requerido"),
  period_month: z.string().optional(),
  currency_id: requiredStringId("La moneda es requerida"),
  amount_estimated: z.coerce
    .number({ error: "El monto estimado es requerido" })
    .min(0, "El monto debe ser mayor o igual a 0"),
  status: z.string().optional(),
  notes: z.string().optional(),
});

export type BudgetsSchema = z.infer<typeof budgetsSchema>;

export const fundingSchema = z.object({
  source: z.string().min(1, "El origen es requerido"),
  currency_id: requiredStringId("La moneda es requerida"),
  amount: z.coerce
    .number({ error: "El monto es requerido" })
    .min(0, "El monto debe ser mayor o igual a 0"),
  notes: z.string().optional(),
});

export type FundingSchema = z.infer<typeof fundingSchema>;
