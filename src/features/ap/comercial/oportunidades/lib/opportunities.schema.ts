import { requiredStringId } from "@/shared/lib/global.schema";
import { z } from "zod";

// Opportunity Schemas
export const opportunitySchemaCreate = z.object({
  client_id: requiredStringId("Cliente"),
  family_id: requiredStringId("Familia de producto"),
  opportunity_type_id: requiredStringId("Tipo de oportunidad"),
  client_status_id: requiredStringId("Estado del cliente"),
  opportunity_status_id: requiredStringId("Estado de la oportunidad"),
});

export const opportunitySchemaUpdate = opportunitySchemaCreate.partial();

export type OpportunitySchema = z.infer<typeof opportunitySchemaCreate>;

// Opportunity Action Schemas
export const opportunityActionSchemaCreate = z.object({
  opportunity_id: z.union([z.string(), z.number()]).transform(val => String(val)).pipe(z.string()),
  action_type_id: z.union([z.string(), z.number()]).transform(val => String(val)).pipe(z.string()),
  action_contact_type_id: z.union([z.string(), z.number()]).transform(val => String(val)).pipe(z.string()),
  description: z
    .string()
    .min(10, "La descripción debe tener al menos 10 caracteres"),
  result: z.boolean({
    error: "El resultado es requerido",
  }),
});

export const opportunityActionSchemaUpdate =
  opportunityActionSchemaCreate.partial();

export type OpportunityActionSchema = z.infer<
  typeof opportunityActionSchemaCreate
>;

// Filter Schemas
export const myOpportunitiesFiltersSchema = z.object({
  opportunity_status_id: z.number().optional(),
  family_id: z.number().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
});

export type MyOpportunitiesFiltersSchema = z.infer<
  typeof myOpportunitiesFiltersSchema
>;

export const myAgendaFiltersSchema = z.object({
  date_from: z.string().min(1, "Fecha de inicio es requerida"),
  date_to: z.string().min(1, "Fecha de fin es requerida"),
});

export type MyAgendaFiltersSchema = z.infer<typeof myAgendaFiltersSchema>;
