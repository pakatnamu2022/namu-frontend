import { useQuery } from "@tanstack/react-query";
import {
  WorkScheduleResource,
  WorkScheduleResponse,
  WorkScheduleSummaryResponse,
} from "./work-schedule.interface";
import {
  getAllWorkSchedules,
  getWorkSchedules,
  getWorkSchedulesByPeriod,
  getWorkScheduleSummary,
} from "./work-schedule.actions";
import { WORK_SCHEDULE } from "./work-schedule.constant";

const { QUERY_KEY } = WORK_SCHEDULE;

export const useWorkSchedules = (params?: Record<string, any>) => {
  return useQuery<WorkScheduleResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getWorkSchedules({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllWorkSchedules = (params?: Record<string, any>) => {
  return useQuery<WorkScheduleResource[]>({
    queryKey: [`${QUERY_KEY}-all`, params],
    queryFn: () => getAllWorkSchedules(params),
    refetchOnWindowFocus: false,
  });
};

export const useWorkSchedulesByPeriod = (
  periodId: number | null,
  params?: Record<string, any>
) => {
  return useQuery<WorkScheduleResource[]>({
    queryKey: [`${QUERY_KEY}-period`, periodId, params],
    queryFn: () => getWorkSchedulesByPeriod(periodId!, params),
    refetchOnWindowFocus: false,
    enabled: !!periodId,
  });
};

export const useWorkScheduleSummary = (periodId: number | null) => {
  return useQuery<WorkScheduleSummaryResponse>({
    queryKey: [`${QUERY_KEY}-summary`, periodId],
    queryFn: () => getWorkScheduleSummary(periodId!),
    refetchOnWindowFocus: false,
    enabled: !!periodId,
  });
};
