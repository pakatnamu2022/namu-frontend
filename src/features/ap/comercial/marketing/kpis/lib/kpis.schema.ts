import { requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

export const kpisSchema = z.object({
  activity_id: requiredStringId("La actividad es requerida"),
  period_month: z.string().optional(),
  period_year: z.coerce.number().optional(),
  leads: z.coerce.number().optional(),
  sales: z.coerce.number().optional(),
  investment: z.coerce.number().optional(),
  currency_id: z.string().optional(),
  notes: z.string().optional(),
});

export type KpisSchema = z.infer<typeof kpisSchema>;
