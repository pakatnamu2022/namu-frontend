import { z } from "zod";

export const goalTravelSchemaCreate = z.object({
  date: z
    .string()
    .min(1, { message: "El Periodo es requerido" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: "Formato de fecha inválido. ",
    }),

  total: z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (typeof val === "string") {
        const parsed = parseFloat(val);
        return isNaN(parsed) ? 0 : parsed;
      }
      return val;
    })
    .refine((value) => value > 0, {
      message: "El total de la meta debe ser mayor a 0",
    }),
});

export const goalTravelSchemaUpdate = goalTravelSchemaCreate.extend({
  id: z.number().optional(),
});

export type GoalTravelSchema = z.infer<typeof goalTravelSchemaCreate>;
