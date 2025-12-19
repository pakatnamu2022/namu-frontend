import { optionalStringId, requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

export const apBankSchemaCreate = z.object({
  code: z
    .string()
    .max(50)
    .refine((value) => value.trim() !== "", {
      message: "Código es requerido",
    }),
  description: z.string().optional(),
  account_number: z.string().max(50).optional(),
  cci: z.string().max(50).optional(),
  bank_id: requiredStringId("Selecciona un Banco"),
  currency_id: requiredStringId("Selecciona una Moneda"),
  company_branch_id: optionalStringId("Selecciona una Sede"),
  sede_id: requiredStringId("Selecciona una Sede"),
});

export const apBankSchemaUpdate = apBankSchemaCreate.partial();

export type ApBankSchema = z.infer<typeof apBankSchemaCreate>;
