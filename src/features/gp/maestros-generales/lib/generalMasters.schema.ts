import { z } from "zod";

export const generalMastersSchemaCreate = z.object({
  code: z
    .string()
    .max(50)
    .refine((value) => value.trim() !== "", {
      message: "Código es requerido",
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
  value: z.string().max(255).optional(),
  status: z.boolean().optional().default(true),
});

export const generalMastersSchemaUpdate =
  generalMastersSchemaCreate.partial();

export type GeneralMastersSchema = z.infer<
  typeof generalMastersSchemaCreate
>;
