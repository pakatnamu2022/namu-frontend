import { useQuery } from "@tanstack/react-query";
import { WORK_SCHEDULE } from "./work-schedule.constants";
import { getWorkSchedules, getWorkScheduleById } from "./work-schedule.actions";
import type { WorkScheduleFilters } from "./work-schedule.interface";

const { QUERY_KEY } = WORK_SCHEDULE;

export const useWorkSchedules = (filters: WorkScheduleFilters) => {
  return useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: () => getWorkSchedules(filters),
    refetchOnWindowFocus: false,
  });
};

export const useWorkScheduleById = (id: number | null) => {
  return useQuery({
    queryKey: [QUERY_KEY, "detail", id],
    queryFn: () => getWorkScheduleById(id!),
    enabled: !!id,
    refetchOnWindowFocus: false,
  });
};
