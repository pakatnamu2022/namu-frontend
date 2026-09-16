import { z } from "zod";

export const signerSchemaCreate = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio").max(250),
  file: z.instanceof(File, { message: "El certificado (.cer) es obligatorio" }),
  key: z.instanceof(File, { message: "La llave privada (.key) es obligatoria" }),
  firmaimg: z.instanceof(File).nullable().optional(),
  password: z.string().max(250).optional().or(z.literal("")),
  fecha_vencimiento: z.string().optional().or(z.literal("")),
  persona_id: z.union([z.string(), z.number()]).optional().or(z.literal("")),
  sucursal_id: z.union([z.string(), z.number()]).optional().or(z.literal("")),
});

export const signerSchemaUpdate = signerSchemaCreate
  .omit({ file: true, key: true })
  .extend({
    file: z.instanceof(File).nullable().optional(),
    key: z.instanceof(File).nullable().optional(),
  })
  .partial();

export type SignerSchema = z.infer<typeof signerSchemaCreate>;
