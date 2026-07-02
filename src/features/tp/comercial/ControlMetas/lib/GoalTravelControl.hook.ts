import { useQuery } from "@tanstack/react-query";
import {
  AlertasCumplimiento,
  ComparativaMensualResponse,
  DashboardGoalTravelControlResponse,
  GoalTravelControlResponse,
  GoalTravelQueryParams,
  RankingConductor,
  ViajesNoFacturadosResponse,
} from "./GoalTravelControl.interface";
import { findGoalTravelById, getAlertsGoalTravel, getAvailableYearsGoalTravel, getComparativaMensual, getDashboardGoalTravel, getGoalTravel, getRankingGoalTravel, getViajesNoFacturados } from "./GoalTravelControl.actions";

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

export const useAlertsGoalTravel = () => {
  return useQuery<AlertasCumplimiento>({
    queryKey: ["alerts-goal"],
    queryFn: () => getAlertsGoalTravel(),
    refetchOnWindowFocus: false,
    // Refetch cada 5 minutos
    refetchInterval: 5 * 60 * 1000,
  });
};

export const useAvailableYearsGoalTravel = () => {
  return useQuery<number[]>({
    queryKey: ["available-years-goal"],
    queryFn: () => getAvailableYearsGoalTravel(),
    refetchOnWindowFocus: false,
  });
};

export const useComparativaMensual = (year?: number, month?: number) => {
  return useQuery<ComparativaMensualResponse>({
    queryKey: ["comparativa-mensual", year, month],
    queryFn: () => getComparativaMensual({ params: { year, month } }),
    refetchOnWindowFocus: false,
    enabled: !!year && !!month,
    staleTime: 5 * 60 * 1000,
  });
};

export const useViajesNoFacturados = (dias: number = 4) => {
  return useQuery<ViajesNoFacturadosResponse>({
    queryKey: ["viajes-no-facturados", dias],
    queryFn: () => getViajesNoFacturados({ params: { dias } }),
    refetchOnWindowFocus: false,
    refetchInterval: 10 * 60 * 1000,
    staleTime: 5 * 60 * 1000,
  });
};


