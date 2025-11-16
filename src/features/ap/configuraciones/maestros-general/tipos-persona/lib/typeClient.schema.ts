import { z } from "zod";

export const typeClientSchemaCreate = z.object({
  code: z
    .string()
    .max(255)
    .refine((value) => value.trim() !== "", {
      message: "Cód. Dynamic es requerido",
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

export const typeClientSchemaUpdate = typeClientSchemaCreate.partial();

export type TypeClientSchema = z.infer<typeof typeClientSchemaCreate>;
