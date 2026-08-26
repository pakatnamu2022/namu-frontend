export type ProductivityStatus =
  | "critical"
  | "warning"
  | "on_track"
  | "exceeded";

export interface ProductivityDashboardFilters {
  year: number;
  month: number;
  sede_id?: number;
  use_cache?: boolean;
}

export interface ProductivityPeriodInfo {
  start_date: string;
  end_date: string;
  current_date: string;
  total_days: number;
  working_days: number;
  description: string;
}

export interface ProductivityConfigurations {
  working_hours_per_day: number;
  earnings_per_hour: number;
}

export interface ProductivityStatusBreakdown {
  exceeded: number;
  on_track: number;
  warning: number;
  critical: number;
}

export interface ProductivityExecutiveSummary {
  total_technicians: number;
  total_headquarters: number;
  total_standard_hours: number;
  total_billed_hours: number;
  total_productivity_hours: number;
  total_earnings: number;
  average_productivity_percentage: number;
  status: ProductivityStatus;
  status_breakdown: ProductivityStatusBreakdown;
}

export interface ProductivityHeadquarterSummary {
  rank: number;
  sede_id: number;
  sede_name: string;
  sede_abbreviation: string;
  technician_count: number;
  total_standard_hours: number;
  total_billed_hours: number;
  total_productivity_hours: number;
  total_earnings: number;
  average_productivity_percentage: number;
  status: ProductivityStatus;
}

export interface ProductivityTechnicianDetail {
  rank: number;
  sede_id: number;
  sede_name: string;
  sede_abbreviation: string;
  worker_id: number;
  worker_dni: string;
  worker_name: string;
  has_error?: boolean;
  days_worked?: number;
  real_hours?: number;
  standard_hours: number;
  billed_hours: number;
  productivity_hours: number;
  productivity_percentage: number;
  earnings: number;
  status: ProductivityStatus;
}

export interface ProductivityChartData {
  labels: string[];
  datasets: {
    standard_hours: number[];
    billed_hours: number[];
    productivity_hours: number[];
    earnings: number[];
    productivity_percentage: number[];
  };
}

export interface ProductivityDashboardData {
  period: ProductivityPeriodInfo;
  configurations: ProductivityConfigurations;
  executive_summary: ProductivityExecutiveSummary;
  headquarters_summary: ProductivityHeadquarterSummary[];
  technician_detail: ProductivityTechnicianDetail[];
  chart_data: ProductivityChartData;
}

export interface ProductivityDashboardResponse {
  success: boolean;
  data: ProductivityDashboardData;
}

export interface ProductivityTechnicianDetailFilters {
  worker_id: number;
  date_range: [string, string];
  sede_id?: number;
}

export interface ProductivityTechnicianInfo {
  worker_id: number;
  worker_name: string;
  worker_dni: string;
}

export interface ProductivityDetailSummary {
  real_hours: number;
  billed_hours: number;
  standard_hours: number;
  productivity_hours: number;
  productivity_percentage: number;
  commission: number;
  earnings_per_hour: number;
  total_work_orders: number;
}

export interface ProductivityWorkOrder {
  work_order_id: number;
  work_order_number: string;
  sede: string;
  asesor: string;
  asesor_id: number;
  fecha_facturacion: string;
  tipo_planificacion: string;
  categoria_tipo?: string;
  descripcion_labour?: string;
  horas_facturadas_total_ot: number;
  cantidad_tecnicos: number;
  horas_facturadas_tecnico: number;
  tiene_mano_obra: boolean;
  labour_hourly_rate?: number;
  labour_current_hourly_cost?: number;
}

export interface ProductivityWorkOrderWithoutLabour {
  work_order_id: number;
  work_order_number: string;
  sede: string;
  asesor: string;
  asesor_id: number;
  fecha_facturacion: string;
  tipo_planificacion: string;
  horas_trabajadas: number;
  observacion: string;
}

export interface ProductivityDetailValidation {
  suma_detalle_horas_trabajadas: number;
  total_resumen_horas_trabajadas: number;
  cuadra_horas_trabajadas: boolean;
  suma_detalle_horas_facturadas: number;
  total_resumen_horas_facturadas: number;
  cuadra_horas_facturadas: boolean;
  cuadra: boolean;
}

export interface ProductivityTechnicianDetailData {
  technician_info: ProductivityTechnicianInfo;
  period: ProductivityPeriodInfo;
  summary: ProductivityDetailSummary;
  work_orders: ProductivityWorkOrder[];
  work_orders_without_labour: ProductivityWorkOrderWithoutLabour[];
  validation: ProductivityDetailValidation;
}

export interface ProductivityTechnicianDetailResponse {
  success: boolean;
  message: string;
  data: ProductivityTechnicianDetailData;
}
