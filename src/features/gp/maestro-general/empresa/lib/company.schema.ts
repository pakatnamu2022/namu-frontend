import { requiredNumber, requiredText } from "@/shared/lib/global.schema";
import { z } from "zod";

export const companySchemaCreate = z.object({
  name: requiredText("Nombre es requerido"),
  abbreviation: z.string().refine((value) => value.trim() !== "", {
    message: "Abreviatura es requerida",
  }),
  businessName: z.string().refine((value) => value.trim() !== "", {
    message: "Razón social es requerida",
  }),
  description: z.string().optional(),
  email: z.email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  website: z.string().optional(),
  detraction_amount: requiredNumber("Monto de detracción", 0),
});

export const companySchemaUpdate = companySchemaCreate.partial();

export type CompanySchema = z.infer<typeof companySchemaCreate>;
