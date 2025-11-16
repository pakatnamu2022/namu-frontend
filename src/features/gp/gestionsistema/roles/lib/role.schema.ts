import { z } from "zod";

export const roleSchemaCreate = z.object({
  nombre: z
    .string()
    .max(255)
    .refine((value) => value.trim() !== "", {
      message: "Nombre es requerida",
    }),
  descripcion: z
    .string()
    .max(255)
    .refine((value) => value.trim() !== "", {
      message: "Descripción es requerida",
    }),
});

export const roleSchemaUpdate = roleSchemaCreate.partial();

export type RoleSchema = z.infer<typeof roleSchemaCreate>;
