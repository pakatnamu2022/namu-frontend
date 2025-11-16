import {
  requiredNumber,
  requiredStringId,
} from "@/shared/lib/global.schema";
import { z } from "zod";

export const apSafeCreditGoalSchemaCreate = z.object({
  year: z.number().int().positive(),
  month: z.number().int().positive(),
  goal_amount: requiredNumber("Meta es requerido", 1),
  type: z
    .string()
    .max(255)
    .refine((value) => value.trim() !== "", {
      message: "Tipo es requerido",
    }),
  sede_id: requiredStringId("Selecciona una Sede"),
});

export const apSafeCreditGoalSchemaUpdate =
  apSafeCreditGoalSchemaCreate.partial();

export type ApSafeCreditGoalSchema = z.infer<
  typeof apSafeCreditGoalSchemaCreate
>;
