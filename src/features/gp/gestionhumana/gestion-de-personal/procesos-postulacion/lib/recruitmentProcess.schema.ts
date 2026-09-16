import { z } from "zod";

const requiredId = (message: string) =>
  z
    .union([z.string(), z.number()])
    .refine((v) => v !== "" && v !== null && v !== undefined && Number(v) > 0, {
      message,
    });

export const recruitmentProcessSchemaCreate = z.object({
  nombre_postulacion: z.string().min(1, "El nombre es obligatorio").max(250),
  cant_trab_solicita: z.coerce
    .number({ message: "Ingrese una cantidad" })
    .int()
    .min(1, "Debe solicitar al menos 1 trabajador"),
  sede_id: requiredId("La sede es obligatoria"),
  area_id: requiredId("El área es obligatoria"),
  cargo_id: requiredId("El cargo es obligatorio"),
  fecha_inicio: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha de inicio es obligatoria"),
  solicitante_id: z.union([z.string(), z.number()]).optional().or(z.literal("")),
  prioridad: z.union([z.string(), z.number()]).optional().or(z.literal("")),
});

export const recruitmentProcessSchemaUpdate =
  recruitmentProcessSchemaCreate.partial();

export type RecruitmentProcessSchema = z.infer<
  typeof recruitmentProcessSchemaCreate
>;

export const pauseProcessSchema = z.object({
  motivo: z.string().min(1, "El motivo es obligatorio").max(250),
});

export type PauseProcessSchema = z.infer<typeof pauseProcessSchema>;

export const addProcessDaysSchema = z.object({
  proceso_postulacion_ids: z
    .array(z.union([z.string(), z.number()]))
    .min(1, "Seleccione al menos un proceso"),
  dias: z.coerce
    .number({ message: "Ingrese los días" })
    .int()
    .min(1, "Mínimo 1 día")
    .max(60, "Máximo 60 días"),
  motivo: z.string().min(1, "El motivo es obligatorio").max(250),
});

export type AddProcessDaysSchema = z.infer<typeof addProcessDaysSchema>;
