import { z } from "zod";

export const scrumItemSchema = z.object({
  project_id: z.string().min(1, "Selecciona un proyecto"),
  sprint_id: z.string().optional().or(z.literal("")),
  parent_id: z.string().optional().or(z.literal("")),
  type: z.enum(["tarea", "historia", "funcion", "solicitud", "error"]).default("tarea"),
  title: z.string().min(1, "El título es requerido").max(255),
  description: z.string().max(5000).optional().or(z.literal("")),
  status: z.enum(["backlog", "por_hacer", "en_progreso", "en_revision", "hecho"]).default("backlog"),
  priority: z.enum(["alta", "media", "baja"]).default("media"),
  // Escala Fibonacci de Scrum (1,2,3,5,8,13,21): FormSelect entrega el
  // value como string, por eso se valida contra ese enum en vez de un
  // z.number() libre.
  story_points: z.enum(["1", "2", "3", "5", "8", "13", "21"]).optional().or(z.literal("")),
  estimated_hours: z.union([z.string(), z.number()]).optional().or(z.literal("")),
  start_date: z.string().optional().or(z.literal("")),
  due_date: z.string().optional().or(z.literal("")),
  assigned_to: z.string().optional().or(z.literal("")),
  tag_ids: z.array(z.number()).optional(),
});

export type ScrumItemSchema = z.infer<typeof scrumItemSchema>;
