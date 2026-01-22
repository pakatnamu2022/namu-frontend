import { z } from "zod";

export const productCategorySchemaCreate = z.object({
  code: z
    .string()
    .max(50)
    .refine((value) => value.trim() !== "", {
      message: "Nombre es requerido",
    }),
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
  status: z.boolean().optional().default(true),
});

export const productCategorySchemaUpdate =
  productCategorySchemaCreate.partial();

export type ProductCategorySchema = z.infer<typeof productCategorySchemaCreate>;
