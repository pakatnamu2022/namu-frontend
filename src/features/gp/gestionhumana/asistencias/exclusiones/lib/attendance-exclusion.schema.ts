import { optionalStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

export const attendanceExclusionSchemaCreate = z.object({
  person_id: optionalStringId("La persona es obligatoria"),
  reason: z
    .string()
    .max(500, "El motivo no puede exceder 500 caracteres")
    .optional()
    .or(z.literal("")),
  active: z.boolean().default(true),
});

export const attendanceExclusionSchemaUpdate = z.object({
  reason: z
    .string()
    .max(500, "El motivo no puede exceder 500 caracteres")
    .optional()
    .or(z.literal("")),
  active: z.boolean().default(true),
});

export type AttendanceExclusionCreateSchema = z.infer<
  typeof attendanceExclusionSchemaCreate
>;
export type AttendanceExclusionUpdateSchema = z.infer<
  typeof attendanceExclusionSchemaUpdate
>;
