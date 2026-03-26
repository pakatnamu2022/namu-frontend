import { z } from "zod";

export const typesPlanningSchemaCreate = z.object({
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
  validate_receipt: z.boolean(),
  validate_labor: z.boolean(),
  type_document: z
    .string()
    .max(100)
    .refine((value) => value.trim() !== "", {
      message: "Tipo de documento es requerido",
    }),
  status: z.boolean().optional().default(true),
});

export const typesPlanningSchemaUpdate = typesPlanningSchemaCreate.partial();

export type TypesPlanningSchema = z.infer<typeof typesPlanningSchemaCreate>;
