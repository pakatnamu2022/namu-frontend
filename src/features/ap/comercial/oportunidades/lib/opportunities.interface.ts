import { type Links, type Meta } from "@/shared/lib/pagination.interface";
import { CustomersResource } from "../../clientes/lib/customers.interface";
import { FamiliesResource } from "@/features/ap/configuraciones/vehiculos/familias/lib/families.interface";
import { OpportunityActionResource } from "./opportunityAction.interface";
import { WorkerResource } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.interface";
import { ManageLeadsResource } from "../../gestionar-leads/lib/manageLeads.interface";

export interface OpportunitiesResponse {
  data: OpportunityResource[];
  links: Links;
  meta: Meta;
}

export interface OpportunityResource {
  id: number;
  worker_id: number;
  client_id: number;
  family_id: number;
  opportunity_type_id: number;
  client_status_id: number;
  opportunity_status_id: number;
  is_closed: boolean;
  comment?: string;
  worker: WorkerResource;
  client: CustomersResource;
  family: FamiliesResource;
  opportunity_type: string;
  client_status: string;
  opportunity_status: string;
  actions: OpportunityActionResource[];
  lead: ManageLeadsResource;
  created_at: string;
}

export interface AgendaDateGroup {
  date: string;
  count: number;
  count_positive_result: number;
  count_negative_result: number;
  actions: OpportunityActionResource[];
}

export type MyAgendaResponse = AgendaDateGroup[];

export interface GetOpportunitiesProps {
  params?: Record<string, any>;
}

export interface GetMyOpportunitiesProps {
  worker_id?: number;
  asesor_id?: number; // For filtering by advisor when user has permission
  opportunity_status_id?: number;
  family_id?: number;
  date_from?: string;
  has_purchase_request_quote?: number;
  opportunity_id?: number;
  date_to?: string;
  page?: number;
}

export interface GetMyAgendaProps {
  worker_id?: number;
  date_from: string;
  date_to: string;
  result?: boolean;
}

// Commercial Masters Types
export interface CommercialMaster {
  id: number;
  code: string;
  description: string;
  type: string;
  status: boolean;
}

export interface CommercialMastersResponse {
  data: CommercialMaster[];
}

export type OpportunityStatusType =
  | "ABIERTA"
  | "FRIA"
  | "TEMPLADA"
  | "CALIENTE"
  | "GANADA"
  | "PERDIDA";

export type ClientStatusType =
  | "PROSPECTO"
  | "CALIFICADO"
  | "EN NEGOCIACIÓN"
  | "LISTO PARA CERRAR";

export type ActionType = "SEGUIMIENTO" | "OFERTA";

export type ContactType =
  | "EMAIL"
  | "TELÉFONO"
  | "REUNIÓN"
  | "VIDEOLLAMADA"
  | "WHATSAPP";
