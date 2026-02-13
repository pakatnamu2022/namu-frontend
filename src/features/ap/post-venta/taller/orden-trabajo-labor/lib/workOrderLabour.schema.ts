import { requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

export const createWorkOrderLabourSchema = (maxDiscount: number) => {
  return z.object({
    description: z.string().min(1, "La descripción es requerida"),
    time_spent: z.string().min(1, "El tiempo es requerido"),
    hourly_rate: z.string().min(1, "La tarifa por hora es requerida"),
    discount_percentage: z
      .union([z.string(), z.number()])
      .optional()
      .refine(
        (val) => {
          if (val === undefined || val === null || val === "") return true;
          const numVal = typeof val === "string" ? parseFloat(val) : val;
          return !isNaN(numVal) && numVal >= 0 && numVal <= maxDiscount;
        },
        {
          message: `El descuento no puede ser mayor a ${maxDiscount}%`,
        },
      ),
    work_order_id: requiredStringId("La orden de trabajo es requerida"),
    worker_id: z.string().optional(),
    group_number: z.number().min(1, "El número de grupo es requerido"),
  });
};

export const workOrderLabourSchema = createWorkOrderLabourSchema(100);

export type WorkOrderLabourFormValues = z.infer<typeof workOrderLabourSchema>;
