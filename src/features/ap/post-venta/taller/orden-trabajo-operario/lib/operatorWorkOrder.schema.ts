import { requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

export const operatorWorkOrderSchema = z.object({
  work_order_id: z.number(),
  group_number: z.number({
    message: "El número de grupo es requerido",
  }),
  operator_id: requiredStringId("El operario es requerido"),
  observations: z.string().optional(),
});

export type OperatorWorkOrderFormData = z.infer<typeof operatorWorkOrderSchema>;
