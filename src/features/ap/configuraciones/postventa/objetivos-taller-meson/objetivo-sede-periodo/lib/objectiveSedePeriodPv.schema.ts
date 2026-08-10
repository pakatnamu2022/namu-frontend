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
  amount: z.coerce
    .number()
    .refine((value) => value >= 0, { message: "Monto debe ser mayor o igual a 0" }),
});

export type ObjectiveSedePeriodPvSchema = z.infer<
  typeof objectiveSedePeriodPvSchema
>;
