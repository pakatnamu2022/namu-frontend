import {
  requiredNumber,
  requiredStringId,
} from "@/src/shared/lib/global.schema";
import { z } from "zod";

export const assignBrandConsultantSchemaCreate = z.object({
  year: z.number().int().positive(),
  month: z.number().int().positive(),
  sede_id: requiredStringId("Selecciona una Sede"),
  brand_id: requiredStringId("Selecciona una Marca"),
  worker_id: requiredStringId("Selecciona un Asesor"),
  sales_target: requiredNumber("Objetivo"),
});

export const assignBrandConsultantSchemaUpdate =
  assignBrandConsultantSchemaCreate.partial();

export type AssignBrandConsultantSchema = z.infer<
  typeof assignBrandConsultantSchemaCreate
>;
