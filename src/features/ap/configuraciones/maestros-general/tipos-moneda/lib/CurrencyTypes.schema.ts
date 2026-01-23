import { requiredText } from "@/shared/lib/global.schema";
import { z } from "zod";

export const currencyTypesSchemaCreate = z.object({
  code: requiredText("Codigo es requerido", 1, 5),
  name: requiredText("Nombre es requerido", 3, 50),
  symbol: requiredText("Simbolo es requerido", 1, 5),
  status: z.boolean().optional().default(true),
  enable_after_sales: z.boolean().optional().default(false),
  enable_commercial: z.boolean().optional().default(false),
});

export const currencyTypesSchemaUpdate = currencyTypesSchemaCreate.partial();

export type CurrencyTypesSchema = z.infer<typeof currencyTypesSchemaCreate>;
