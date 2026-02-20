import { z } from "zod";

export const telephonePlanSchemaCreate = z.object({
  name: z.string().min(1, "Ingresa el nombre del plan").max(100),
  price: z.coerce.number().min(0, "Ingresa un precio válido"),
  description: z.string().min(1, "Ingresa la descripción del plan").max(500),
});

export const telephonePlanSchemaUpdate = telephonePlanSchemaCreate.partial();

export type TelephonePlanSchema = z.infer<typeof telephonePlanSchemaCreate>;
