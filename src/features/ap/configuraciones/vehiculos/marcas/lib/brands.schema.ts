import { requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

const imageField = z
  .any()
  .transform((val) => {
    // Si es undefined o null, retornar undefined
    if (val === undefined || val === null) return undefined;
    // Si es un File, retornar el File
    if (val instanceof File) return val;
    // Cualquier otro valor se considera undefined
    return undefined;
  })
  .optional()
  .refine(
    (file) => file === undefined || file === null || file instanceof File,
    {
      message: "Archivo inválido",
    }
  )
  .refine((file) => !file || file.size <= 2 * 1024 * 1024, {
    message: "Máximo 2MB",
  })
  .refine(
    (file) =>
      !file || ["image/jpeg", "image/png", "image/webp"].includes(file.type),
    {
      message: "Formatos permitidos: JPG, PNG, WebP",
    }
  );

export const brandSchemaCreate = z.object({
  code: z
    .string()
    .max(100, { message: "Máximo 100 caracteres" })
    .refine((value) => value.trim() !== "", {
      message: "Código es requerido",
    }),
  dyn_code: z
    .string()
    .max(100, { message: "Máximo 100 caracteres" })
    .default("-"),
  name: z
    .string()
    .max(255, { message: "Máximo 255 caracteres" })
    .refine((value) => value.trim() !== "", {
      message: "Nombre es requerido",
    }),
  description: z
    .string()
    .max(255, { message: "Máximo 255 caracteres" })
    .refine((value) => value.trim() !== "", {
      message: "Descripción es requerida",
    }),
  logo: imageField,
  logo_min: imageField,
  group_id: requiredStringId("Selecciona un grupo"),
  type_operation_id: z.string().optional(),
  status: z.boolean().optional().default(true),
});

export const brandSchemaUpdate = brandSchemaCreate.partial();

export type BrandsSchema = z.infer<typeof brandSchemaCreate>;

// Tipos para el manejo de FormData
export interface BrandFormData extends Omit<BrandsSchema, "logo" | "logo_min"> {
  logo?: File | null;
  logo_min?: File | null;
}

// Helper para validar FormData antes del envío
export function validateBrandFormData(data: any): BrandsSchema {
  return brandSchemaCreate.parse(data);
}

export function validateBrandUpdateFormData(data: any): Partial<BrandsSchema> {
  return brandSchemaUpdate.parse(data);
}
