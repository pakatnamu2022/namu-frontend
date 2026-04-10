import {
  requiredDecimalNumber,
  requiredStringId,
  requiredText,
} from "@/shared/lib/global.schema";
import { z } from "zod";

export const workOrderPlanningSchema = z.object({
  work_order_id: requiredStringId("La orden de trabajo es requerida"),
  worker_id: requiredStringId("El trabajador es requerido"),
  description: requiredText("La descripción", 3, 255),
  estimated_hours: requiredDecimalNumber("Las horas estimadas", 0.5),
  planned_start_datetime: z
    .string()
    .min(1, "La fecha y hora de inicio es requerida"),
  group_number: z
    .number()
    .int()
    .positive("El número de grupo debe ser un número positivo"),
});

export const startSessionSchema = z.object({
  notes: z
    .string()
    .max(500, "Las notas no pueden exceder 500 caracteres")
    .optional(),
});

export const pauseWorkSchema = z.object({
  pause_reason: z
    .string()
    .trim()
    .min(1, "La razón de pausa es requerida")
    .max(255, "La razón de pausa no puede exceder 255 caracteres"),
});

export const exceptionalCaseSchema = z
  .object({
    work_order_id: requiredStringId("La orden de trabajo es requerida"),
    worker_id: requiredStringId("El operario es requerido"),
    description: requiredText("La descripción", 3, 500),
    estimated_hours: requiredDecimalNumber("Las horas estimadas", 0.5),
    planned_start_datetime: z
      .string()
      .min(1, "La hora de inicio es requerida"),
    planned_end_datetime: z.string().min(1, "La hora de fin es requerida"),
    group_number: z
      .number()
      .int()
      .positive("El número de grupo debe ser un número positivo"),
  })
  .refine(
    (data) => {
      if (!data.planned_start_datetime || !data.planned_end_datetime)
        return true;
      const start = new Date(data.planned_start_datetime);
      const end = new Date(data.planned_end_datetime);
      // Mismo día
      return (
        start.getFullYear() === end.getFullYear() &&
        start.getMonth() === end.getMonth() &&
        start.getDate() === end.getDate()
      );
    },
    {
      message: "La fecha de inicio y fin deben ser el mismo día",
      path: ["planned_end_datetime"],
    },
  )
  .refine(
    (data) => {
      if (!data.planned_start_datetime || !data.planned_end_datetime)
        return true;
      return new Date(data.planned_end_datetime) > new Date(data.planned_start_datetime);
    },
    {
      message: "La hora de fin debe ser posterior a la hora de inicio",
      path: ["planned_end_datetime"],
    },
  );

export type WorkOrderPlanningFormValues = z.infer<
  typeof workOrderPlanningSchema
>;
export type StartSessionFormValues = z.infer<typeof startSessionSchema>;
export type PauseWorkFormValues = z.infer<typeof pauseWorkSchema>;
export type ExceptionalCaseFormValues = z.infer<typeof exceptionalCaseSchema>;
