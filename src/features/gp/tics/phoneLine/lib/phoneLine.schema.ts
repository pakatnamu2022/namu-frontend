import { z } from "zod";

export const phoneLineSchemaCreate = z.object({
  telephone_account_id: z.string().min(1, "Selecciona una cuenta telefónica"),
  telephone_plan_id: z.string().min(1, "Selecciona un plan telefónico"),
  line_number: z.string().min(1, "Ingresa el número de línea").max(50),
  status: z.string().min(1, "Selecciona un estado"),
  is_active: z.boolean().default(false),
});

export const phoneLineSchemaUpdate = phoneLineSchemaCreate.partial();

export type PhoneLineSchema = z.infer<typeof phoneLineSchemaCreate>;
