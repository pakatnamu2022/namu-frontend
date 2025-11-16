import { z } from "zod";

export const fuelTypeSchemaCreate = z.object({
  code: z
    .string()
    .max(50)
    .refine((value) => value.trim() !== "", {
      message: "Código es requerido",
    }),
  description: z
    .string()
    .max(255)
    .refine((value) => value.trim() !== "", {
      message: "Descripción es requerida",
    }),
  electric_motor: z.boolean().optional(),
  status: z.boolean().optional().default(true),
});

export const fuelTypeSchemaUpdate = fuelTypeSchemaCreate.partial();

export type FuelTypeSchema = z.infer<typeof fuelTypeSchemaCreate>;
