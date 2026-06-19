import { z } from "zod";

export const scrumSprintSchema = z.object({
  project_id: z.string().min(1, "Selecciona un proyecto"),
  name: z.string().min(1, "El nombre es requerido").max(255),
  goal: z.string().max(2000).optional().or(z.literal("")),
  start_date: z.string().optional().or(z.literal("")),
  end_date: z.string().optional().or(z.literal("")),
  status: z.enum(["planeado", "activo", "cerrado"]).default("planeado"),
});

export type ScrumSprintSchema = z.infer<typeof scrumSprintSchema>;
