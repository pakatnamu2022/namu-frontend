import { z } from "zod";

export const reasonDiscardingSparePartSchemaCreate = z.object({
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

export const reasonDiscardingSparePartSchemaUpdate =
  reasonDiscardingSparePartSchemaCreate.partial();

export type ReasonDiscardingSparePartSchema = z.infer<
  typeof reasonDiscardingSparePartSchemaCreate
>;
