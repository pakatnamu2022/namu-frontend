import { z } from "zod";

export const reasonDiscardingTallerSchemaCreate = z.object({
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

export const reasonDiscardingTallerSchemaUpdate =
  reasonDiscardingTallerSchemaCreate.partial();

export type ReasonDiscardingTallerSchema = z.infer<
  typeof reasonDiscardingTallerSchemaCreate
>;
