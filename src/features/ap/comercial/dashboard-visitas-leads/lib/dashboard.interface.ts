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
