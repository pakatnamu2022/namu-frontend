import { useQuery } from "@tanstack/react-query";
import { ATTENDANCE } from "./attendance.constants";
import { getAttendanceRecords, getAttendanceById } from "./attendance.actions";
import type { AttendanceFilters } from "./attendance.interface";

const { QUERY_KEY } = ATTENDANCE;

export const useAttendanceRecords = (filters: AttendanceFilters) => {
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
