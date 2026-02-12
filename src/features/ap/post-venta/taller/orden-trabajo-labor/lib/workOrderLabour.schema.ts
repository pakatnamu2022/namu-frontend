import { requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

export const workOrderLabourSchema = z.object({
  description: z.string().min(1, "La descripción es requerida"),
  time_spent: z.string().min(1, "El tiempo es requerido"),
  hourly_rate: z.string().min(1, "La tarifa por hora es requerida"),
  discount_percentage: z.string().optional(),
  work_order_id: requiredStringId("La orden de trabajo es requerida"),
  worker_id: z.string().optional(),
  group_number: z.number().min(1, "El número de grupo es requerido"),
});

export type WorkOrderLabourFormValues = z.infer<typeof workOrderLabourSchema>;
