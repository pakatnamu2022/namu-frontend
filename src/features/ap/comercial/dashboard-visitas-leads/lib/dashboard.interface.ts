// Dashboard Types and Interfaces

export interface OpportunityStates {
  FRIO?: number;
  TEMPLADO?: number;
  CALIENTE?: number;
  "VENTA CONCRETADA"?: number;
  CERRADA?: number;
}

export interface IndicatorsByDateRangeResponse<T> {
  success: boolean;
  data: T;
  periodo: {
    fecha_inicio: string;
    fecha_fin: string;
  };
}

export interface IndicatorsByDateTotalRange {
  total_visitas: number;
  no_atendidos: number;
  atendidos: number;
  descartados: number;
  por_estado_oportunidad: OpportunityStates;
}

export interface IndicatorsByDateRange {
  fecha: Date;
  total_visitas: number;
  promedio_tiempo: string;
  porcentaje_atendidos: number;
  estados_visita: EstadosVisita;
  por_estado_oportunidad: PorEstadoOportunidad[];
}

export interface IndicatorsByUser {
  user_id: number | null;
  user_nombre: string;
  total_visitas: number;
  estados_visita: EstadosVisita;
  por_estado_oportunidad: OpportunityStates;
}

export interface IndicatorsByCampaign {
  campaign: string;
  total_visitas: number;
  estados_visita: EstadosVisita;
  por_estado_oportunidad: OpportunityStates;
}

export interface EstadosVisita {
  no_atendidos: number;
  atendidos: number;
  descartados: number;
}

export interface PorEstadoOportunidad {
  estado_oportunidad: string;
  cantidad: number;
}

export interface IndicatorBySede {
  sede_id: number;
  sede_nombre: string;
  sede_abreviatura: string;
  total_visitas: number;
  no_atendidos: number;
  atendidos: number;
  descartados: number;
  por_estado_oportunidad: OpportunityStates;
}

export interface IndicatorsBySedeResponse {
  success: boolean;
  data: IndicatorBySede[];
}

export interface IndicatorBySedeAndBrand {
  sede_id: number;
  sede_nombre: string;
  sede_abreviatura: string;
  vehicle_brand_id: number;
  marca_nombre: string;
  total_visitas: number;
}

export interface IndicatorsBySedeAndBrandResponse {
  success: boolean;
  data: IndicatorBySedeAndBrand[];
}

export interface IndicatorByAdvisor {
  worker_id: number;
  worker_nombre: string;
  sede_id: number;
  sede_nombre: string;
  sede_abreviatura: string;
  vehicle_brand_id: number;
  marca_nombre: string;
  total_visitas: number;
  no_atendidos: number;
  atendidos: number;
  descartados: number;
  por_estado_oportunidad: OpportunityStates;
}

export interface IndicatorsByAdvisorResponse {
  success: boolean;
  data: IndicatorByAdvisor[];
}

export interface DashboardFilters {
  date_from: string;
  date_to: string;
  type: "VISITA" | "LEADS";
}

// Sales Manager Dashboard Interfaces
export interface SalesManagerStatsResponse {
  success: boolean;
  data: {
    manager_info: {
      boss_id: number;
      boss_name: string;
      boss_position: string;
    };
    team_totals: {
      total_advisors: number;
      total_visits: number;
      not_attended: number;
      attended: number;
      discarded: number;
      attention_percentage: number;
      by_opportunity_status: {
        [key: string]: number;
      };
    };
    by_advisor: AdvisorStats[];
  };
  period: {
    start_date: string;
    end_date: string;
  };
}

export interface AdvisorStats {
  worker_id: number;
  worker_name: string;
  total_visits: number;
  not_attended: number;
  attended: number;
  discarded: number;
  attention_percentage: number;
  average_response_time: string;
  by_opportunity_status: {
    [key: string]: number;
  };
}

export interface SalesManagerFilters {
  date_from: string;
  date_to: string;
  type: "VISITA" | "LEADS";
  boss_id?: number | null;
}

export interface SalesManagerDetailsFilters extends SalesManagerFilters {
  worker_id?: number | null;
}

export interface LeadVisitDetail {
  id: number;
  registration_date: string;
  model: string;
  version: string;
  num_doc: string;
  status_num_doc: string;
  use: number;
  comment: string | null;
  full_name: string;
  phone: string;
  email: string;
  campaign: string;
  type: string;
  worker_id: number;
  income_sector_id: number;
  sede_id: number;
  vehicle_brand_id: number;
  document_type_id: number;
  area_id: number;
  user_id: number;
  reason_discarding_id: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  worker: {
    id: number;
    nombre_completo: string;
    email: string;
    cel_personal: string;
    [key: string]: any;
  };
  sede: {
    id: number;
    localidad: string;
    suc_abrev: string;
    abreviatura: string;
    [key: string]: any;
  };
  vehicle_brand: {
    id: number;
    name: string;
    description: string;
    [key: string]: any;
  };
  document_type: {
    id: number;
    code: string;
    description: string;
    [key: string]: any;
  };
  opportunity: any | null;
}

export interface SalesManagerDetailsResponse {
  success: boolean;
  data: LeadVisitDetail[];
}
