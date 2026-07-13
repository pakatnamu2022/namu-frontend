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

// ============================================================
// INTERFACES PARA ANÁLISIS ESTRATÉGICO
// ============================================================

export interface TendenciaMes {
  periodo: string;
  meta: number;
  real: number;
  cumplimiento: number;
}

export interface ClienteMensual {
  periodo: string;
  year: number;
  month: number;
  produccion: number;
  viajes: number;
}

export interface ClienteTendencia {
  tipo: 'creciente_fuerte' | 'creciente' | 'estable' | 'decreciente' | 'decreciente_fuerte' | 'insuficiente';
  descripcion: string;
  cambios_positivos: number;
  cambios_negativos: number;
  variacion_total_periodo: number;
  porcentaje_total: number;
  mes_maximo: ClienteMensual | null;
  mes_minimo: ClienteMensual | null;
}

export interface MesDecrecimiento {
  periodo: string;
  year: number;
  month: number;
  decrementos: number;
  clientes_afectados: string[];
}

export interface ClienteVariacionMejorado {
  cliente_id: number;
  cliente: string;
  ruc?: string;
  actual: number;
  anterior: number;
  diferencia: number;
  variacion: number;
  viajes_actual: number;
  viajes_anterior: number;
  promedio_viaje_actual: number;
  promedio_viaje_anterior: number;
  tendencia: ClienteTendencia;
  categoria: string;
  mes_maximo: ClienteMensual | null;
  mes_minimo: ClienteMensual | null;
}

export interface ClienteNuevoInactivoMejorado {
  cliente_id: number;
  cliente: string;
  ruc?: string;
  produccion: number;        // Para nuevos: es la producción actual
  produccion_actual: number; // Para compatibilidad con el frontend
  produccion_anterior: number; // Para compatibilidad con el frontend
  viajes?: number;
}

export interface ResumenClientes {
  total_clientes_actual: number;
  total_clientes_anterior: number;
  clientes_con_crecimiento: number;
  clientes_con_decrecimiento: number;
  clientes_nuevos: number;
  clientes_inactivos: number;
  total_produccion_actual: number;
  total_produccion_anterior: number;
  variacion_total: number;
  porcentaje_variacion: number;
  periodo_actual: string;
  periodo_anterior: string;
  mejor_mes: { periodo: string; total: number } | null;
  peor_mes: { periodo: string; total: number } | null;
}

export interface ProyeccionCierre {
  acumulado: number;
  promedio_diario: number;
  proyeccion: number;
  meta: number;
  cumplimiento: number;
  dias_transcurridos: number;
  dias_totales: number;
  periodo: string;
}

export interface DistribucionCliente {
  cliente: string;
  produccion: number;
  porcentaje: number;
  acumulado?: number;
}

// ============================================================
// ANALISIS ESTRATEGICO RESPONSE - UNICA DEFINICION
// ============================================================
export interface AnalisisEstrategicoResponse {
  tendencia: TendenciaMes[];
  top_crecimiento: ClienteVariacionMejorado[];
  top_decrecimiento: ClienteVariacionMejorado[];
  clientes_nuevos: ClienteNuevoInactivoMejorado[];
  clientes_inactivos: ClienteNuevoInactivoMejorado[];
  top_meses_decrecimiento: MesDecrecimiento[];
  proyeccion: ProyeccionCierre;
  distribucion: DistribucionCliente[];
  resumen?: ResumenClientes;
  analisis_gerencial?: AnalisisGerencial; // NUEVO
}

export interface PrediccionIAResponse {
  success: boolean;
  message?: string;
  datos_historicos: Array<{
    mes: number;
    periodo: string;
    produccion: number;
    year: number;
    month: number;
  }>;
  prediccion: {
    produccion_estimada: number;
    meta_mes_actual: number;
    cumplimiento_proyectado: number;
    precision: number;
    nivel_confianza: 'alto' | 'medio' | 'bajo';
    meses_analizados: number;
    factor_confianza: number;
    tendencia: 'creciente' | 'decreciente';
    variacion_mensual: number;
    r2: number;
    metodo_principal?: string;
    prediccion_exponencial?: number;
  };
  recomendaciones: string[];
  grafico: Array<{
    periodo: string;
    real: number | null;
    tendencia: number;
    es_prediccion: boolean;
  }>;
}

export interface MesEstacionalidad {
  year: number;
  month: number;
  periodo: string;
  clientes_activos: number;
  total_viajes: number;
  produccion_total: number;
  promedio_viaje: number;
  produccion_por_cliente: number;
}

export interface ConcentracionClientes {
  total_clientes: number;
  clientes_80_20: number;
  porcentaje_top1: number;
  porcentaje_top5: number;
  porcentaje_top10: number;
  promedio_por_cliente: number;
  desviacion_estandar: number;
}

export interface TendenciaMensual {
  year: number;
  month: number;
  periodo: string;
  produccion: number;
  produccion_anterior: number | null;
  variacion_mensual: number | null;
}

export interface ClienteVolatil {
  cliente_id: number;
  cliente: string;
  produccion_promedio: number;
  volatilidad: number;
  coeficiente_variacion: number;
  meses_activos: number;
}

export interface ClienteRecuperado {
  cliente_id: number;
  cliente: string;
  total_meses_activos: number;
  veces_recuperado: number;
  promedio_meses_ausente: number;
}

export interface TopPerformer {
  cliente_id: number;
  cliente: string;
  mejor_mes: string;
  produccion: number;  // <-- CAMBIADO: antes era 'produccion_mejor_mes'
  year: number;
  month: number;
}

export interface TendenciaGeneral {
  tipo: 'crecimiento_acelerado' | 'crecimiento_sostenido' | 'decrecimiento_acelerado' | 'decrecimiento_sostenido' | 'estable' | 'insuficiente';
  descripcion: string;
  meses_crecientes: number;
  meses_decrecientes: number;
  promedio_variacion: number;
  variacion_total: number;
  porcentaje_total: number;
  total_meses: number;
}

export interface ResumenEjecutivo {
  total_clientes: number;
  clientes_80_20: number;
  porcentaje_top5: number;
  porcentaje_top10: number;
  promedio_por_cliente: number;
  desviacion_estandar: number;
  total_meses_analizados: number;
  mejor_mes: MesEstacionalidad | null;
  peor_mes: MesEstacionalidad | null;
  tendencia_general: TendenciaGeneral;
}

export interface AnalisisGerencial {
  estacionalidad: MesEstacionalidad[];
  concentracion: ConcentracionClientes | null;
  tendencia_mensual: TendenciaMensual[];
  clientes_volatiles: ClienteVolatil[];
  clientes_recuperados: ClienteRecuperado[];
  top_performers: TopPerformer[];
  resumen_ejecutivo: ResumenEjecutivo;
}



