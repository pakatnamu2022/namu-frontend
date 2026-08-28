import { requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

export const insuranceSchema = z.object({
  business_partner_id: requiredStringId("La aseguradora es requerida"),
  period_id: requiredStringId("El periodo es requerido"),
});

export type InsuranceSchema = z.infer<typeof insuranceSchema>;

export const insuranceManualSchema = z.object({
  company_id: requiredStringId("La empresa es requerida"),
  worker_id: requiredStringId("El trabajador es requerido"),
  period_id: requiredStringId("El periodo es requerido"),
  business_partner_id: requiredStringId("La aseguradora es requerida"),
  doc_number_affiliate: z.string().optional().or(z.literal("")),
  contracting_name: z.string().optional().or(z.literal("")),
  num_doc_contracting: z.string().optional().or(z.literal("")),
  rate_with_tax: z.string().optional().or(z.literal("")),
});

export type InsuranceManualSchema = z.infer<typeof insuranceManualSchema>;
