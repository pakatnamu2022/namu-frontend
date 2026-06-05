import { requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

export const insuranceSchema = z.object({
  business_partner_id: requiredStringId("La aseguradora es requerida"),
  period_id: requiredStringId("El periodo es requerido"),
});

export type InsuranceSchema = z.infer<typeof insuranceSchema>;
