import { z } from "zod";

export const objectiveSedePeriodPvSchema = z.object({
  sede_id: z
    .string()
    .refine((value) => value.trim() !== "", { message: "Sede es requerida" }),
  year: z
    .string()
    .refine((value) => value.trim() !== "", { message: "Año es requerido" }),
  month: z
    .string()
    .refine((value) => value.trim() !== "", { message: "Mes es requerido" }),
});

export type ObjectiveSedePeriodPvSchema = z.infer<
  typeof objectiveSedePeriodPvSchema
>;
