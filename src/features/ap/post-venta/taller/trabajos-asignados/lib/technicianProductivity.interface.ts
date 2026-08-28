export interface TechnicianProductivityFilters {
  worker_id: number;
  date_range: [string, string];
  sede_id?: number;
}

export interface TechnicianProductivityInfo {
  worker_id: number;
  worker_name: string;
  worker_dni: string;
}

export interface TechnicianProductivityPeriod {
  start_date: string;
  end_date: string;
  current_date: string;
  total_days: number;
  working_days: number;
  description: string;
}

export interface TechnicianProductivitySummary {
  real_hours: number;
  billed_hours: number;
  standard_hours: number;
  productivity_hours: number;
  productivity_percentage: number;
  commission: number;
  earnings_per_hour: number;
  total_work_orders: number;
}

export interface TechnicianProductivityWorkOrder {
  work_order_id: number;
  work_order_number: string;
  vehicle_plate?: string;
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

export interface TechnicianProductivityWorkOrderWithoutLabour {
  work_order_id: number;
  work_order_number: string;
  vehicle_plate?: string;
  sede: string;
  asesor: string;
  asesor_id: number;
  fecha_facturacion: string;
  tipo_planificacion: string;
  horas_trabajadas: number;
  observacion: string;
}

export interface TechnicianProductivityValidation {
  suma_detalle_horas_trabajadas: number;
  total_resumen_horas_trabajadas: number;
  cuadra_horas_trabajadas: boolean;
  suma_detalle_horas_facturadas: number;
  total_resumen_horas_facturadas: number;
  cuadra_horas_facturadas: boolean;
  cuadra: boolean;
}

export interface TechnicianProductivityData {
  technician_info: TechnicianProductivityInfo;
  period: TechnicianProductivityPeriod;
  summary: TechnicianProductivitySummary;
  work_orders: TechnicianProductivityWorkOrder[];
  work_orders_without_labour: TechnicianProductivityWorkOrderWithoutLabour[];
  validation: TechnicianProductivityValidation;
}

export interface TechnicianProductivityResponse {
  success: boolean;
  message: string;
  data: TechnicianProductivityData;
}
