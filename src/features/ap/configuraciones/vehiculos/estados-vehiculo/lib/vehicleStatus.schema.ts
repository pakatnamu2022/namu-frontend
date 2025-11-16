import { z } from "zod";

export const vehicleStatusSchemaCreate = z.object({
  code: z
    .string()
    .max(100)
    .refine((value) => value.trim() !== "", {
      message: "Código es requerido",
    }),
  description: z.string().refine((value) => value.trim() !== "", {
    message: "Descripción es requerido",
  }),
  use: z.string().refine((value) => value.trim() !== "", {
    message: "Categoría es requerido",
  }),
  color: z.string().refine((value) => value.trim() !== "", {
    message: "Color es requerido",
  }),
  status: z.boolean().optional().default(true),
});

export const vehicleStatusSchemaUpdate = vehicleStatusSchemaCreate.partial();

export type VehicleStatusSchema = z.infer<typeof vehicleStatusSchemaCreate>;
