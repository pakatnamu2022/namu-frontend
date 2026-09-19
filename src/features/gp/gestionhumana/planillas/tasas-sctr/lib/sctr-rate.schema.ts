import { z } from "zod";

// Las tasas se ingresan en porcentaje (ej. 0.53 = 0.53%) y se envían como fracción.
const percentage = (label: string) =>
  z
    .string()
    .min(1, `${label} es obligatoria`)
    .refine(
      (v) => !isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 100,
      `${label} debe ser un porcentaje entre 0 y 100`,
    );

export const sctrRateSchemaCreate = z.object({
  company_id: z.string().min(1, "La empresa es obligatoria"),
  health_rate: percentage("La tasa de salud"),
  pension_rate: percentage("La tasa de pensión"),
  effective_from: z.string().min(1, "La fecha de inicio es obligatoria"),
});

export type SctrRateCreateSchema = z.infer<typeof sctrRateSchemaCreate>;
