import { z } from "zod";

export const economicActivitySchemaCreate = z.object({
  description: z
    .string()
    .max(255)
    .refine((value) => value.trim() !== "", {
      message: "Descripción es requerida",
    }),
  type: z
    .string()
    .max(100)
    .refine((value) => value.trim() !== "", {
      message: "Tipo es requerido",
    }),
  status: z.boolean().optional().default(true),
});

export const economicActivitySchemaUpdate =
  economicActivitySchemaCreate.partial();

export type EconomicActivitySchema = z.infer<
  typeof economicActivitySchemaCreate
>;
