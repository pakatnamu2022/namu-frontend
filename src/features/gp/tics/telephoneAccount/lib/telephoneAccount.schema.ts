import { optionalStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

export const telephoneAccountSchemaCreate = z.object({
  company_id: optionalStringId("Selecciona una empresa"),
  account_number: z.string().min(1, "Ingresa el número de cuenta").max(100),
  operator: z.string().min(1, "Ingresa el operador").max(100),
});

export const telephoneAccountSchemaUpdate =
  telephoneAccountSchemaCreate.partial();

export type TelephoneAccountSchema = z.infer<
  typeof telephoneAccountSchemaCreate
>;
