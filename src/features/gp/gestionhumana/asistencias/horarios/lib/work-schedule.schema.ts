import { z } from "zod";
import { optionalStringId } from "@/shared/lib/global.schema";

const timeField = z
  .string()
  .regex(/^\d{2}:\d{2}$/, "Formato HH:MM requerido")
  .nullable()
  .optional();

const timeRequired = z
  .string()
  .min(1, "Este campo es requerido")
  .regex(/^\d{2}:\d{2}$/, "Formato HH:MM requerido");

export const workScheduleDetailSchema = z.object({
  day_of_week: z.coerce.number().min(1).max(7),
  checkin: timeField,
  lunch_out: timeField,
  lunch_in: timeField,
  checkout: timeField,
});

export const workScheduleSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100),
  checkin: timeRequired,
  lunch_out: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Formato HH:MM requerido")
    .nullable()
    .optional()
    .or(z.literal("")),
  lunch_in: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Formato HH:MM requerido")
    .nullable()
    .optional()
    .or(z.literal("")),
  checkout: timeRequired,
  details: z.array(workScheduleDetailSchema).optional().default([]),
});

export const workScheduleAssignBulkSchema = z
  .object({
    cargo_id: optionalStringId("Selecciona una posición"),
    area_id: optionalStringId("Selecciona un área"),
    sede_id: optionalStringId("Selecciona una sede"),
    empresa_id: optionalStringId("Selecciona una empresa"),
  })
  .refine(
    (data) =>
      data.cargo_id || data.area_id || data.sede_id || data.empresa_id,
    { message: "Debe especificar al menos un filtro" },
  );

export type WorkScheduleSchema = z.infer<typeof workScheduleSchema>;
export type WorkScheduleDetailSchema = z.infer<typeof workScheduleDetailSchema>;
export type WorkScheduleAssignBulkSchema = z.infer<
  typeof workScheduleAssignBulkSchema
>;
