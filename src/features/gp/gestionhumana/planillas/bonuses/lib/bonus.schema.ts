import {
  requiredDecimalNumber,
  requiredStringId,
} from "@/shared/lib/global.schema";
import { z } from "zod";

export const bonusSchema = z.object({
  worker_id: requiredStringId("El trabajador es requerido"),
  period_id: requiredStringId("El periodo es requerido"),
  amount: requiredDecimalNumber("El monto es requerido"),
  type_id: requiredStringId("El tipo de bonificación es requerido"),
});

export type BonusSchema = z.infer<typeof bonusSchema>;
