import { useQuery } from "@tanstack/react-query";
import {
  AlertasCumplimiento,
  AnalisisEstrategicoResponse,
  ComparativaMensualResponse,
  DashboardGoalTravelControlResponse,
  GoalTravelControlResponse,
  GoalTravelQueryParams,
  PrediccionIAResponse,
  RankingConductor,
  ViajesNoFacturadosResponse,
} from "./GoalTravelControl.interface";
import { findGoalTravelById, getAlertsGoalTravel, getAnalisisEstrategico, getAvailableYearsGoalTravel, getComparativaMensual, getDashboardGoalTravel, getGoalTravel, getPrediccionIA, getRankingGoalTravel, getViajesNoFacturados } from "./GoalTravelControl.actions";

export const useGoalTravelControl = (params?: GoalTravelQueryParams) => {
  return useQuery<GoalTravelControlResponse>({
    queryKey: ["goal", params],
    queryFn: () => getGoalTravel({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useGoalTravelById = (id: number) => {
  return useQuery({
    queryKey: ["goal", id],
    queryFn: () => findGoalTravelById(id),
    refetchOnWindowFocus: false,
  });
};

export const useDashboardGoalTravelControl = (year?: number, month?: number) => {
  return useQuery<DashboardGoalTravelControlResponse>({
    queryKey: ["dashboard-goal", year, month],
    queryFn: () => getDashboardGoalTravel({ params: { year, month } }),
    refetchOnWindowFocus: false,
    enabled: !!year && !!month,
    staleTime: 5 * 60 * 1000,
  });
};
export const useRankingGoalTravel = (
  periodo: "week" | "month" = "month",
  limit: number = 10,
  year?: number,
  month?: number
) => {
  return useQuery<RankingConductor[]>({
    queryKey: ["ranking-goal", periodo, limit, year, month],
    queryFn: () => getRankingGoalTravel({ params: { periodo, limit, year, month } }),
    refetchOnWindowFocus: false,
    staleTime: 10 * 60 * 1000,
  });
};

export const useAlertsGoalTravel = (year?: number, month?: number) => {
  return useQuery<AlertasCumplimiento>({
    queryKey: ["alerts-goal", year, month],
    queryFn: () => getAlertsGoalTravel({ params: { year, month } }),
    refetchOnWindowFocus: false,
    refetchInterval: 5 * 60 * 1000,
    enabled: !!year && !!month,
  });
};

export const useAvailableYearsGoalTravel = () => {
  return useQuery<number[]>({
    queryKey: ["available-years-goal"],
    queryFn: () => getAvailableYearsGoalTravel(),
    refetchOnWindowFocus: false,
  });
};

export const useComparativaMensual = (
  year1?: number,
  month1?: number,
  year2?: number,
  month2?: number
) => {
  return useQuery<ComparativaMensualResponse>({
    queryKey: ["comparativa-mensual", year1, month1, year2, month2],
    queryFn: () => getComparativaMensual({
      params: { year1, month1, year2, month2 }
    }),
    refetchOnWindowFocus: false,
    enabled: !!year1 && !!month1,
    staleTime: 5 * 60 * 1000,
  });
};

export const useViajesNoFacturados = (dias: number = 4, year?: number, month?: number) => {
  return useQuery<ViajesNoFacturadosResponse>({
    queryKey: ["viajes-no-facturados", dias, year, month],
    queryFn: () => getViajesNoFacturados({ params: { dias, year, month } }),
    refetchOnWindowFocus: false,
    refetchInterval: 10 * 60 * 1000,
    staleTime: 5 * 60 * 1000,
    enabled: !!year,
  });
};

export const useAnalisisEstrategico = (fechaInicio?: string, fechaFin?: string) => {
  return useQuery<AnalisisEstrategicoResponse>({
    queryKey: ["analisis-estrategico", fechaInicio, fechaFin],
    queryFn: () => getAnalisisEstrategico({ params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin } }),
    refetchOnWindowFocus: false,
    staleTime: 0,
    enabled: !!fechaInicio && !!fechaFin,
  });
};

export const usePrediccionIA = (
  mesesHistoricos: number = 12,
  factorConfianza: number = 1.0,
  enabled: boolean = false
) => {
  return useQuery<PrediccionIAResponse>({
    queryKey: ["prediccion-ia", mesesHistoricos, factorConfianza],
    queryFn: () => getPrediccionIA({
      params: {
        meses_historicos: mesesHistoricos,
        factor_confianza: factorConfianza
      }
    }),
    refetchOnWindowFocus: false,
    enabled,
    staleTime: 5 * 60 * 1000,
  });
};




