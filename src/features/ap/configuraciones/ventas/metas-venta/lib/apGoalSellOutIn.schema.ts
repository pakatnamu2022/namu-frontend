import {
  requiredNumber,
  requiredStringId,
} from "@/shared/lib/global.schema";
import { z } from "zod";

export const apGoalSellOutInSchemaCreate = z.object({
  year: z.number().int().min(2000, "El año es requerido"),
  month: z.number().int().min(1, "El mes es requerido").max(12, "Mes inválido"),
  goal: requiredNumber("Meta"),
  type: z.enum(["OUT", "IN"]).optional(),
  brand_id: requiredStringId("Selecciona una Marca"),
  shop_id: requiredStringId("Selecciona una Tienda"),
});

export const apGoalSellOutInSchemaUpdate =
  apGoalSellOutInSchemaCreate.partial();

export type ApGoalSellOutInSchema = z.infer<typeof apGoalSellOutInSchemaCreate>;
