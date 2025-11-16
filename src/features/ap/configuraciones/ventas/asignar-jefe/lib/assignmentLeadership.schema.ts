import { requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

export const assignmentLeadershipSchemaCreate = z.object({
  year: z.number().int().min(2000, "El año es requerido"),
  month: z.number().int().min(1, "El mes es requerido").max(12, "Mes inválido"),
  boss_id: requiredStringId("Selecciona una Jefe de Ventas"),
  assigned_workers: z
    .array(
      z.object({
        id: z.number().int().positive(),
        name: z.string().min(1, "El asesor es requerido"),
      })
    )
    .min(1, { message: "Debe seleccionar al menos un asesor" }),
});

export const assignmentLeadershipSchemaUpdate =
  assignmentLeadershipSchemaCreate.partial();

export type AssignmentLeadershipSchema = z.infer<
  typeof assignmentLeadershipSchemaCreate
>;
