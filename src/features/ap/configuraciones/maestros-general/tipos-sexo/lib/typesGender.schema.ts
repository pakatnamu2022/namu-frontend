import { z } from "zod";

export const typeGenderSchemaCreate = z.object({
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

export const typeGenderSchemaUpdate = typeGenderSchemaCreate.partial();

export type TypeGenderSchema = z.infer<typeof typeGenderSchemaCreate>;
