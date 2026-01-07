import { z } from "zod";

const generalMastersSchemaBase = z.object({
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
  status: z.boolean().optional(),
});

export const generalMastersSchemaCreate = generalMastersSchemaBase.transform(
  (data) => ({
    ...data,
    status: data.status ?? true,
  })
);

export const generalMastersSchemaUpdate = generalMastersSchemaBase.partial();

export type GeneralMastersSchema = z.infer<typeof generalMastersSchemaBase>;
