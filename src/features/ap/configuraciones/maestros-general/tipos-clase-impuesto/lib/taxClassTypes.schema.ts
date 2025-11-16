import { z } from "zod";

export const taxClassTypesSchemaCreate = z.object({
  dyn_code: z
    .string()
    .max(255)
    .refine((value) => value.trim() !== "", {
      message: "Código Dyn es requerida",
    }),
  description: z
    .string()
    .max(255)
    .refine((value) => value.trim() !== "", {
      message: "Descripción es requerida",
    }),
  tax_class: z
    .string()
    .max(255)
    .refine((value) => value.trim() !== "", {
      message: "Clase de impuesto es requerida",
    }),
  type: z
    .string()
    .max(100)
    .refine((value) => value.trim() !== "", {
      message: "Tipo es requerido",
    }),
  status: z.boolean().optional().default(true),
});

export const taxClassTypesSchemaUpdate = taxClassTypesSchemaCreate.partial();

export type TaxClassTypesSchema = z.infer<typeof taxClassTypesSchemaCreate>;
