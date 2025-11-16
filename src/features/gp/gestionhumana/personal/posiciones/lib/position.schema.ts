import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const positionSchemaCreate = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(255),
  descripcion: z.string().optional(),
  area_id: z.string().optional(),
  hierarchical_category_id: z.string().optional(),
  cargo_id: z.string().optional(),
  ntrabajadores: z.string().min(0).optional(),
  banda_salarial_min: z.string().min(0).optional(),
  banda_salarial_media: z.string().min(0).optional(),
  banda_salarial_max: z.string().min(0).optional(),
  tipo_onboarding_id: z.string().optional(),
  plazo_proceso_seleccion: z.string().min(0).optional(),
  presupuesto: z.string().min(0).optional(),
  mof_adjunto: z
    .instanceof(File, { message: "El archivo MOF es obligatorio" })
    .refine(
      (file) => file.size <= MAX_FILE_SIZE,
      "El archivo debe ser menor a 5MB"
    )
    .refine(
      (file) => ACCEPTED_FILE_TYPES.includes(file.type),
      "Solo se permiten archivos PDF, DOC o DOCX"
    ),
  files: z
    .array(
      z
        .instanceof(File)
        .refine(
          (file) => file.size <= MAX_FILE_SIZE,
          "Cada archivo debe ser menor a 5MB"
        )
        .refine(
          (file) => ACCEPTED_FILE_TYPES.includes(file.type),
          "Solo se permiten archivos PDF, DOC o DOCX"
        )
    )
    .max(6, "Máximo 6 archivos adicionales")
    .optional(),
});

export const positionSchemaUpdate = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(255),
  descripcion: z.string().optional(),
  area_id: z.string().optional(),
  hierarchical_category_id: z.string().optional(),
  cargo_id: z.string().optional(),
  ntrabajadores: z.string().min(0).optional(),
  banda_salarial_min: z.string().min(0).optional(),
  banda_salarial_media: z.string().min(0).optional(),
  banda_salarial_max: z.string().min(0).optional(),
  tipo_onboarding_id: z.string().optional(),
  plazo_proceso_seleccion: z.string().min(0).optional(),
  presupuesto: z.string().min(0).optional(),
  mof_adjunto: z
    .instanceof(File)
    .refine(
      (file) => file.size <= MAX_FILE_SIZE,
      "El archivo debe ser menor a 5MB"
    )
    .refine(
      (file) => ACCEPTED_FILE_TYPES.includes(file.type),
      "Solo se permiten archivos PDF, DOC o DOCX"
    )
    .optional(),
  files: z
    .array(
      z
        .instanceof(File)
        .refine(
          (file) => file.size <= MAX_FILE_SIZE,
          "Cada archivo debe ser menor a 5MB"
        )
        .refine(
          (file) => ACCEPTED_FILE_TYPES.includes(file.type),
          "Solo se permiten archivos PDF, DOC o DOCX"
        )
    )
    .max(6, "Máximo 6 archivos adicionales")
    .optional(),
});

export type PositionSchema = z.infer<typeof positionSchemaCreate>;
