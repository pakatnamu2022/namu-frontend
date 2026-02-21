import { z } from "zod";

export const attendanceRuleSchemaUpdate = z.object({
  code: z
    .string()
    .min(1, "El código es requerido")
    .max(10, "El código no puede tener más de 10 caracteres"),
  hour_type: z.enum(["DIURNO", "NOCTURNO", "REFRIGERIO"]),
  hours: z.coerce
    .number()
    .min(0, "Las horas deben ser mayor o igual a 0")
    .max(24, "Las horas no pueden exceder 24")
    .nullable()
    .optional(),
  multiplier: z.coerce
    .number()
    .min(0, "El multiplicador debe ser mayor o igual a 0"),
  pay: z.boolean().default(false),
  use_shift: z.boolean().default(false),
});

export type AttendanceRuleSchema = z.infer<typeof attendanceRuleSchemaUpdate>;
