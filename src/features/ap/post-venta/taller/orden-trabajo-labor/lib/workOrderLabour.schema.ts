import { z } from "zod";

export const workOrderLabourSchema = z.object({
  description: z.string().min(1, "La descripción es requerida"),
  time_spent: z.string().min(1, "El tiempo es requerido"),
  hourly_rate: z.string().min(1, "La tarifa por hora es requerida"),
  work_order_id: z.string().min(1, "El ID de orden de trabajo es requerido"),
});

export type WorkOrderLabourFormValues = z.infer<typeof workOrderLabourSchema>;
