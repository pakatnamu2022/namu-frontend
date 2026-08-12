import { optionalStringId, requiredText } from "@/shared/lib/global.schema";
import { z } from "zod";

export const plansSchema = z.object({
  brand_id: optionalStringId("La marca no es válida"),
  name: requiredText("El nombre del plan"),
  concept: z.string().optional(),
  year: z.coerce
    .number({ error: "El año es requerido" })
    .min(2020, "El año debe ser mayor o igual a 2020")
    .max(2100, "El año debe ser menor o igual a 2100"),
  description: z.string().optional(),
  status: z.string().optional(),
});

export type PlansSchema = z.infer<typeof plansSchema>;
