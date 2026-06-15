import { useQuery } from "@tanstack/react-query";
import { ATTENDANCE } from "./attendance.constants";
import {
  getAttendanceRecords,
  getAttendanceById,
  getSunafilReport,
  getInternalReport,
  getAttendancePersonDashboard,
} from "./attendance.actions";
import type {
  AttendanceFiltersProps,
  AttendanceReportFilters,
  AttendanceSunafilFilters,
} from "./attendance.interface";

const { QUERY_KEY } = ATTENDANCE;

export const useAttendanceRecords = (filters: AttendanceFiltersProps) => {
  return useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: () => getAttendanceRecords(filters),
    refetchOnWindowFocus: false,
  });
};

export const useAttendanceById = (id: number | null) => {
  return useQuery({
    queryKey: [QUERY_KEY, "detail", id],
    queryFn: () => getAttendanceById(id!),
    refetchOnWindowFocus: false,
    enabled: !!id,
  });
};

export const useSunafilReport = (filters: AttendanceSunafilFilters | null) => {
  return useQuery({
    queryKey: [QUERY_KEY, "sunafil", filters],
    queryFn: () => getSunafilReport(filters!),
    enabled: !!filters,
    refetchOnWindowFocus: false,
  });
};

export const useInternalReport = (filters: AttendanceReportFilters | null) => {
  return useQuery({
    queryKey: [QUERY_KEY, "internal", filters],
    queryFn: () => getInternalReport(filters!),
    enabled: !!filters,
    refetchOnWindowFocus: false,
  });
};

export const useAttendancePersonDashboard = (
  personId: number | null,
  filters: Partial<AttendanceReportFilters>,
) => {
  return useQuery({
    queryKey: [QUERY_KEY, "person", personId, filters],
    queryFn: () => getAttendancePersonDashboard(personId!, filters),
    enabled: !!personId,
    refetchOnWindowFocus: false,
  });
};
