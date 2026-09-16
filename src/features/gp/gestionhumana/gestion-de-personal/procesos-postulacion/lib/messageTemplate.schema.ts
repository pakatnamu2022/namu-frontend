import { z } from "zod";

export const messageTemplateSchema = z.object({
  asunto: z.string().min(1, "El asunto es obligatorio").max(200),
  contenido: z.string().min(1, "El contenido es obligatorio"),
  activo: z.boolean(),
});

export type MessageTemplateSchema = z.infer<typeof messageTemplateSchema>;
