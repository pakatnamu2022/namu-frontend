import { z } from "zod";

const requiredId = (message: string) =>
  z
    .union([z.string(), z.number()])
    .refine((v) => v !== "" && v !== null && v !== undefined && Number(v) > 0, {
      message,
    });

export const lifeStatusSchema = z.object({
  estado: requiredId("Seleccione un estado"),
  fecha: z.string().min(1, "La fecha es obligatoria"),
  motivo: z.string().optional().or(z.literal("")),
});

export type LifeStatusSchema = z.infer<typeof lifeStatusSchema>;

export const rehireWorkerSchema = z.object({
  proceso_postulacion_id: requiredId("Seleccione un proceso de postulación"),
});

export type RehireWorkerSchema = z.infer<typeof rehireWorkerSchema>;
