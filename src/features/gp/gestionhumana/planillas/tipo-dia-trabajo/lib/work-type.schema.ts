import { z } from "zod";

// Segment schema
export const workTypeSegmentSchema = z.object({
  id: z.number().optional(),
  segment_type: z.enum(["WORK", "BREAK"], {
    errorMap: () => ({ message: "Tipo de segmento inválido" }),
  }),
  segment_order: z.number().min(1, "El orden debe ser al menos 1"),
  start_hour: z.number().min(0).max(24),
  end_hour: z.number().min(0).max(24),
  duration_hours: z.number().min(0).max(24, "La duración no puede exceder 24 horas"),
  multiplier: z.coerce
    .number()
    .min(0, "El multiplicador debe ser mayor o igual a 0")
    .max(10, "El multiplicador no puede exceder 10"),
  description: z.string().max(255, "La descripción no puede tener más de 255 caracteres").default(""),
  tempId: z.string().optional(),
});

export const workTypeSchemaCreate = z.object({
  code: z
    .string()
    .min(1, "El código es requerido")
    .max(10, "El código no puede tener más de 10 caracteres"),
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(255, "El nombre no puede tener más de 255 caracteres"),
  description: z
    .string()
    .max(500, "La descripción no puede tener más de 500 caracteres")
    .optional()
    .default(""),
  multiplier: z.coerce
    .number()
    .min(0, "El multiplicador debe ser mayor o igual a 0"),
  base_hours: z.coerce
    .number()
    .min(1, "Las horas base deben ser al menos 1"),
  is_extra_hours: z.boolean().default(false),
  is_night_shift: z.boolean().default(false),
  is_holiday: z.boolean().default(false),
  is_sunday: z.boolean().default(false),
  active: z.boolean().default(true),
  order: z.coerce.number().min(0, "El orden debe ser mayor o igual a 0"),
  shift_type: z.enum(["MORNING", "NIGHT"], {
    errorMap: () => ({ message: "Tipo de turno inválido" }),
  }).optional(),
  segments: z.array(workTypeSegmentSchema).default([]),
});

export const workTypeSchemaUpdate = workTypeSchemaCreate.partial();

export type WorkTypeSchema = z.infer<typeof workTypeSchemaCreate>;
export type WorkTypeSegmentSchema = z.infer<typeof workTypeSegmentSchema>;
