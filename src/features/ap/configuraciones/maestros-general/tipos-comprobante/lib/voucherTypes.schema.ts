import { z } from "zod";

export const voucherTypesSchemaCreate = z.object({
  code: z
    .string()
    .max(50)
    .refine((value) => value.trim() !== "", {
      message: "Cod. es requerido",
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

export const voucherTypesSchemaUpdate = voucherTypesSchemaCreate.partial();

export type VoucherTypesSchema = z.infer<typeof voucherTypesSchemaCreate>;
