import { z } from "zod";

export const attendanceCodeMappingSchemaCreate = z.object({
  emp_code: z
    .string()
    .min(1, "El código del dispositivo es obligatorio")
    .max(50, "El código del dispositivo no puede exceder 50 caracteres"),
  vat: z
    .string()
    .min(1, "El DNI es obligatorio")
    .max(20, "El DNI no puede exceder 20 caracteres"),
  note: z
    .string()
    .max(500, "La nota no puede exceder 500 caracteres")
    .optional()
    .or(z.literal("")),
});

export const attendanceCodeMappingSchemaUpdate = attendanceCodeMappingSchemaCreate;

export type AttendanceCodeMappingCreateSchema = z.infer<
  typeof attendanceCodeMappingSchemaCreate
>;
export type AttendanceCodeMappingUpdateSchema = z.infer<
  typeof attendanceCodeMappingSchemaUpdate
>;
