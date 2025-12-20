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
  group_number: z.number().int().positive("El número de grupo debe ser un número positivo"),
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
    .max(255, "La razón de pausa no puede exceder 255 caracteres")
    .optional(),
});

export const exceptionalCaseSchema = z.object({
  work_order_id: requiredStringId("La orden de trabajo es requerida"),
  worker_id: requiredStringId("El operario es requerido"),
  description: requiredText("La descripción", 3, 500),
  estimated_hours: z.string().min(1, "La duración es requerida"),
  planned_start_datetime: z.string().min(1, "La hora de inicio es requerida"),
  group_number: z.number().int().positive("El número de grupo debe ser un número positivo"),
});

export type WorkOrderPlanningFormValues = z.infer<
  typeof workOrderPlanningSchema
>;
export type StartSessionFormValues = z.infer<typeof startSessionSchema>;
export type PauseWorkFormValues = z.infer<typeof pauseWorkSchema>;
export type ExceptionalCaseFormValues = z.infer<typeof exceptionalCaseSchema>;
