import { requiredStringId, requiredText } from "@/shared/lib/global.schema";
import { z } from "zod";

export const activitiesSchema = z
  .object({
    budget_id: requiredStringId("El presupuesto es requerido"),
    activity_type: requiredText("El tipo de actividad", 2, 100),
    name: requiredText("El nombre de la actividad"),
    description: z.string().optional(),
    objective: z.string().optional(),
    responsible: z.string().optional(),
    channel: z.string().optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    currency_id: requiredStringId("La moneda es requerida"),
    estimated_amount: z.coerce
      .number({ error: "El monto estimado es requerido" })
      .min(0, "El monto debe ser mayor o igual a 0"),
    supplier_id: z.string().optional(),
    status: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine(
    (data) =>
      !data.start_date || !data.end_date || data.end_date >= data.start_date,
    { message: "La fecha fin debe ser posterior a la fecha inicio", path: ["end_date"] },
  );

export type ActivitiesSchema = z.infer<typeof activitiesSchema>;

export const activityLocationSchema = z.object({
  sede_id: z.string().optional(),
  location_name: z.string().optional(),
  currency_id: z.string().optional(),
  amount: z.coerce.number().optional(),
  notes: z.string().optional(),
});

export type ActivityLocationSchema = z.infer<typeof activityLocationSchema>;
