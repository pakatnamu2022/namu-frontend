import { z } from "zod";

export const shopSchemaCreate = z.object({
  description: z
    .string()
    .max(255)
    .refine((value) => value.trim() !== "", {
      message: "Descripción es requerida",
    }),
  type: z
    .string()
    .max(100)
    .refine((value) => value.trim() !== "", {
      message: "Tipo es requerido",
    }),
  sedes: z
    .array(
      z.object({
        id: z.number().int().positive(),
        abreviatura: z.string().min(1, "La sede es requerido"),
      })
    )
    .min(1, { message: "Debe seleccionar al menos una sede" }),
});

export const shopSchemaUpdate = shopSchemaCreate.partial();

export type ShopSchema = z.infer<typeof shopSchemaCreate>;
