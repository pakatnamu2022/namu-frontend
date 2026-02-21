import { z } from "zod";

export const workScheduleSchemaCreate = z.object({
  worker_id: z.number().min(1, "El trabajador es requerido"),
  code: z.string().min(1, "El código es requerido"),
  period_id: z.number().min(1, "El periodo es requerido"),
  work_date: z.string().min(1, "La fecha de trabajo es requerida"),
  hours_worked: z.number().min(0).max(24).nullable().optional(),
  extra_hours: z.number().min(0).max(24).nullable().optional(),
  notes: z.string().max(255).nullable().optional(),
  status: z
    .enum([
      "SCHEDULED",
      "WORKED",
      "ABSENT",
      "VACATION",
      "SICK_LEAVE",
      "PERMISSION",
    ])
    .nullable()
    .optional(),
});

export const workScheduleSchemaUpdate = workScheduleSchemaCreate.partial();

export const workScheduleQuickAddSchema = z.object({
  worker_id: z.number().min(1, "El trabajador es requerido"),
  code: z.string().min(1, "El código es requerido"),
  work_date: z.string().min(1, "La fecha de trabajo es requerida"),
  extra_hours: z.number().min(0).max(24).nullable().optional(),
});

export type WorkScheduleSchema = z.infer<typeof workScheduleSchemaCreate>;
export type WorkScheduleQuickAddSchema = z.infer<typeof workScheduleQuickAddSchema>;
