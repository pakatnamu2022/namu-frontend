import {
  requiredDecimalNumber,
  requiredStringId,
} from "@/shared/lib/global.schema";
import { z } from "zod";

export const liquidacionBbssSchema = z.object({
  worker_id: requiredStringId("El trabajador es requerido"),
  period_id: requiredStringId("El periodo es requerido"),
  amount: requiredDecimalNumber("El monto debe ser mayor o igual a 0", 1),
  type_id: requiredStringId("El tipo es requerido"),
});

export type LiquidacionBbssSchema = z.infer<typeof liquidacionBbssSchema>;
