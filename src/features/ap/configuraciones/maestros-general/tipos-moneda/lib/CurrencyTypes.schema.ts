import { z } from "zod";

export const currencyTypesSchemaCreate = z.object({
  code: z
    .string()
    .max(3)
    .refine((value) => value.trim() !== "", {
      message: "Código es requerido",
    }),
  name: z
    .string()
    .max(50)
    .refine((value) => value.trim() !== "", {
      message: "Nombre es requerida",
    }),
  symbol: z
    .string()
    .max(5)
    .refine((value) => value.trim() !== "", {
      message: "Simbolo es requerido",
    }),
  status: z.boolean().optional().default(true),
});

export const currencyTypesSchemaUpdate = currencyTypesSchemaCreate.partial();

export type CurrencyTypesSchema = z.infer<typeof currencyTypesSchemaCreate>;
