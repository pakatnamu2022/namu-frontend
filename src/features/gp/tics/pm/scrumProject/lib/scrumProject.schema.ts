import { z } from "zod";

export const scrumProjectSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(255),
  description: z.string().max(1000).optional().or(z.literal("")),
  color: z.string().optional().or(z.literal("")),
  status: z.enum(["activo", "archivado"]).default("activo"),
  // Costo por hora-hombre del proyecto (USD), usado para estimar el costo
  // total en la vista de Costos del Kanban. Por defecto $10.
  hourly_cost: z.coerce.number().min(0, "Debe ser mayor o igual a 0"),
});

export type ScrumProjectSchema = z.infer<typeof scrumProjectSchema>;
