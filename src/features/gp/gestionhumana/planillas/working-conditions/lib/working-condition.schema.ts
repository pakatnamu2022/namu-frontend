import { requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

export const workingConditionSchema = z.object({
  period_id: requiredStringId("El periodo es requerido"),
});

export type WorkingConditionSchema = z.infer<typeof workingConditionSchema>;
