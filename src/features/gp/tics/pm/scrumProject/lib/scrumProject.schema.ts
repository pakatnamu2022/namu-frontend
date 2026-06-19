import { z } from "zod";

export const scrumProjectSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(255),
  description: z.string().max(1000).optional().or(z.literal("")),
  color: z.string().optional().or(z.literal("")),
  status: z.enum(["activo", "archivado"]).default("activo"),
});

export type ScrumProjectSchema = z.infer<typeof scrumProjectSchema>;
