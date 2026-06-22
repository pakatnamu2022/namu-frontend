import { z } from "zod";

const ACCEPTED_TYPES = ["text/plain", "text/markdown", "text/x-markdown"];
const MAX_SIZE = 10 * 1024 * 1024;

const fileValidator = z
  .instanceof(File)
  .refine((f) => f.size <= MAX_SIZE, "El archivo no debe superar 10 MB")
  .refine(
    (f) => ACCEPTED_TYPES.includes(f.type) || f.name.endsWith(".md"),
    "Solo se permiten archivos .md",
  );

export const manualSchemaCreate = z.object({
  vista_id: z.coerce.number().min(1, "Selecciona una vista"),
  title: z.string().min(1, "Título es requerido").max(255),
  description: z.string().max(500).optional(),
  order: z.coerce.number().min(0).optional(),
  file: fileValidator,
});

export const manualSchemaUpdate = z.object({
  vista_id: z.coerce.number().min(1).optional(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(500).optional(),
  order: z.coerce.number().min(0).optional(),
  file: fileValidator.optional(),
});

export type ManualSchemaCreate = z.infer<typeof manualSchemaCreate>;
export type ManualSchemaUpdate = z.infer<typeof manualSchemaUpdate>;
