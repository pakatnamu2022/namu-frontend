import { z } from "zod";

export const perDiemCategorySchemaCreate = z.object({
  name: z
    .string()
    .max(255)
    .refine((value) => value.trim() !== "", {
      message: "Nombre es requerido",
    }),
  description: z
    .string()
    .max(255)
    .refine((value) => value.trim() !== "", {
      message: "Descripción es requerida",
    }),
  active: z.boolean().optional().default(true),
});

export const perDiemCategorySchemaUpdate =
  perDiemCategorySchemaCreate.partial();

export type PerDiemCategorySchema = z.infer<typeof perDiemCategorySchemaCreate>;
