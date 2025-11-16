import { z } from "zod";

export const unitMeasurementSchemaCreate = z.object({
  dyn_code: z
    .string()
    .max(100)
    .refine((value) => value.trim() !== "", {
      message: "Código Dyn es requerido",
    }),
  nubefac_code: z.string().refine((value) => value.trim() !== "", {
    message: "Código Nubefac es requerido",
  }),
  description: z.string().refine((value) => value.trim() !== "", {
    message: "Descripción es requerido",
  }),
  status: z.boolean().optional().default(true),
});

export const unitMeasurementSchemaUpdate =
  unitMeasurementSchemaCreate.partial();

export type UnitMeasurementSchema = z.infer<typeof unitMeasurementSchemaCreate>;
