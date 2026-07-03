import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface GoalTravelControlResponse {
  data: GoalTravelControlResource[];
  available_years?: number[];
  links: Links;
  meta: Meta;
}

export interface ComparativaMensualResponse {
  clientes: string[];
  viajes_actual: number[];
  viajes_anterior: number[];
  produccion_actual: number[];
  produccion_anterior: number[];
  participacion_actual: number[];
  participacion_anterior: number[];
  resumen: {
    actual: {
      viajes: number;
      produccion: number;
      label: string;
    };
    anterior: {
      viajes: number;
      produccion: number;
      label: string;
    };
  };
  periodo_actual: {
    mes: number;
    anio: number;
    label: string;
  };
  periodo_anterior: {
    mes: number;
    anio: number;
    label: string;
  };
}

export interface ViajeNoFacturado {
  cliente_id: number;
  cliente: string;
  total_viajes: number;
  total_produccion: number;
  viaje_mas_antiguo: string;
  viaje_mas_reciente: string;
  codigos_viajes: string;
}

export interface ViajesNoFacturadosResponse {
  data: ViajeNoFacturado[];
  resumen: {
    total_viajes: number;
    total_produccion: number;
    dias_umbral: number;
    fecha_limite: string;
  };
}
export interface DashboardMeta {
  id: number;
  fecha: string;
  total: number;
  meta_conductor: number;
  meta_vehiculo: number;
  total_unidades: number;
}

export interface DashboardGoalTravelControlResponse {
  meta: DashboardMeta | null;
  conductores: ConductorCumplimiento[];
  vehiculos: VehiculoCumplimiento[];
  resumen: ResumenCumplimiento | null;
}
export interface ConductorCumplimiento {
  conductor_id: number;
  conductor: string;
  total_viajes: number;
  produccion_real: number;
  meta_conductor: number;
  porcentaje_cumplimiento: number;
}
export interface VehiculoCumplimiento {
  vehiculo_id: number;
  vehiculo: string;
  total_viajes: number;
  produccion_real: number;
  meta_vehiculo: number;
  porcentaje_cumplimiento: number;
}

export interface ResumenCumplimiento {
  conductores_activos: number;
  vehiculos_activos: number;
  total_viajes: number;
  produccion_total: number;
  meta_total: number;
  porcentaje_cumplimiento: number;
}
export interface RankingConductor {
  periodo: string;
  position: number;
  medal: string;
  conductor_id: number;
  conductor: string;
  total_viajes: number;
  produccion_total: number;
  promedio_por_viaje: number;
  vehiculos_usados: number;
}
export interface AlertasCumplimiento {
  conductores: AlertaConductor[];
  vehiculos: AlertaVehiculo[];
}
export interface AlertaConductor {
  conductor_id: number;
  conductor: string;
  total_viajes: number;
  produccion: number;
  meta: number;
  porcentaje: number;
}

export interface AlertaVehiculo {
  vehiculo_id: number;
  vehiculo: string;
  total_viajes: number;
  produccion: number;
  meta: number;
  porcentaje: number;
}


export interface GoalTravelControlResource {
  id: number;
  date: Date;
  year?: number;
  month?: number;
  total: number;
  driver_goal: number;
  vehicle_goal: number;
  total_units: number;
  status_deleted: number;
}

export interface GoalTravelSearchFilters {
  search?: string;
  year?: string;
  month?: string;
  status_id?: string;
}

export interface getGoalTravelControlProps {
  params?: Record<string, any>;
}

export interface GoalTravelQueryParams extends GoalTravelSearchFilters {
  page?: number;
  per_page?: number;
}

