import { z } from "zod";

export const familiesSchemaCreate = z.object({
  description: z
    .string()
    .max(255)
    .refine((value) => value.trim() !== "", {
      message: "Descripción es requerida",
    }),
  status: z.boolean().optional().default(true),
  brand_id: z.string().min(1, { message: "Marca es requerida" }),
});

export const familiesSchemaUpdate = familiesSchemaCreate.partial();

export type FamiliesSchema = z.infer<typeof familiesSchemaCreate>;
