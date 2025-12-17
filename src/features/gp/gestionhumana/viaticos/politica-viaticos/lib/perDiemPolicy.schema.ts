import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ["application/pdf"];

const pdfFileField = z
  .instanceof(File, { message: "El archivo PDF es obligatorio" })
  .refine((file) => file.size <= MAX_FILE_SIZE, {
    message: "El archivo debe ser menor a 5MB",
  })
  .refine((file) => ACCEPTED_FILE_TYPES.includes(file.type), {
    message: "Solo se permiten archivos PDF",
  });

const pdfFileFieldOptional = z
  .instanceof(File)
  .refine((file) => file.size <= MAX_FILE_SIZE, {
    message: "El archivo debe ser menor a 5MB",
  })
  .refine((file) => ACCEPTED_FILE_TYPES.includes(file.type), {
    message: "Solo se permiten archivos PDF",
  })
  .optional();

export const perDiemPolicySchemaCreate = z.object({
  version: z
    .string()
    .max(50)
    .refine((value) => value.trim() !== "", {
      message: "Versión es requerida",
    }),
  name: z
    .string()
    .max(255)
    .refine((value) => value.trim() !== "", {
      message: "Nombre es requerido",
    }),
  effective_from: z.union([z.literal(""), z.date()]),
  effective_to: z.union([z.literal(""), z.date()]),
  is_current: z.boolean().optional().default(false),
  document: pdfFileField,
  notes: z.string().max(500).optional().default(""),
});

export const perDiemPolicySchemaUpdate = z.object({
  version: z
    .string()
    .max(50)
    .refine((value) => value.trim() !== "", {
      message: "Versión es requerida",
    }),
  name: z
    .string()
    .max(255)
    .refine((value) => value.trim() !== "", {
      message: "Nombre es requerido",
    }),
  effective_from: z.union([z.literal(""), z.date()]),
  effective_to: z.union([z.literal(""), z.date()]),
  is_current: z.boolean().optional().default(false),
  document: pdfFileFieldOptional,
  notes: z.string().max(500).optional().default(""),
});

export type PerDiemPolicySchema = z.infer<typeof perDiemPolicySchemaCreate>;
export type PerDiemPolicySchemaUpdate = z.infer<
  typeof perDiemPolicySchemaUpdate
>;
