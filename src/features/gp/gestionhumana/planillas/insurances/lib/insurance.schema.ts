import { z } from "zod";

export const insuranceSchema = z.object({
  worker_id: z.coerce.number().min(1, "El trabajador es requerido"),
  period_id: z.coerce.number().min(1, "El periodo es requerido"),
  business_partner_id: z.coerce.number().min(1, "El socio de negocio es requerido"),
  family_group_number: z.string().min(1, "El número de grupo familiar es requerido"),
  relationship: z.string().min(1, "El parentesco es requerido"),
  doc_type_affiliate: z.string().min(1, "El tipo de documento es requerido"),
  doc_number_affiliate: z.string().min(1, "El número de documento es requerido"),
  gender: z.string().min(1, "El género es requerido"),
  paternal_surname: z.string().min(1, "El apellido paterno es requerido"),
  maternal_surname: z.string().min(1, "El apellido materno es requerido"),
  first_name: z.string().min(1, "El primer nombre es requerido"),
  second_name: z.string().default(""),
  entry_date: z.string().min(1, "La fecha de ingreso es requerida"),
  birth_date: z.string().min(1, "La fecha de nacimiento es requerida"),
  condition: z.string().min(1, "La condición es requerida"),
  program: z.string().min(1, "El programa es requerido"),
  plan: z.string().min(1, "El plan es requerido"),
  payment_frequency: z.string().min(1, "La frecuencia de pago es requerida"),
  type: z.string().min(1, "El tipo es requerido"),
  rate_without_tax: z.coerce.number().min(0, "La tasa sin impuesto debe ser mayor o igual a 0"),
  tax: z.coerce.number().min(0, "El impuesto debe ser mayor o igual a 0"),
  rate_with_tax: z.coerce.number().min(0, "La tasa con impuesto debe ser mayor o igual a 0"),
  period_from: z.string().min(1, "El periodo desde es requerido"),
  period_until: z.string().min(1, "El periodo hasta es requerido"),
  affiliation_continuity_date: z.string().default(""),
  affiliation_from: z.string().min(1, "La afiliación desde es requerida"),
  affiliation_until: z.string().min(1, "La afiliación hasta es requerida"),
  status: z.enum(["ACTIVO", "INACTIVO"]),
});

export type InsuranceSchema = z.infer<typeof insuranceSchema>;
