import { z } from "zod";

export const workScheduleSchemaCreate = z.object({
  worker_id: z.number().min(1, "El trabajador es requerido"),
  code: z.string().min(1, "El código es requerido"),
  period_id: z.number().min(1, "El periodo es requerido"),
  work_date: z.string().min(1, "La fecha de trabajo es requerida"),
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
    .optional(),
});

export const workScheduleSchemaUpdate = workScheduleSchemaCreate.partial();

export type WorkScheduleSchema = z.infer<typeof workScheduleSchemaCreate>;
