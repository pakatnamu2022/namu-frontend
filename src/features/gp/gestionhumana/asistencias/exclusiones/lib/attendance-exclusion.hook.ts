import { useQuery } from "@tanstack/react-query";
import {
  AttendanceExclusionResource,
  AttendanceExclusionResponse,
} from "./attendance-exclusion.interface";
import {
  findAttendanceExclusionById,
  getAttendanceExclusions,
} from "./attendance-exclusion.actions";
import { ATTENDANCE_EXCLUSION } from "./attendance-exclusion.constants";

const { QUERY_KEY } = ATTENDANCE_EXCLUSION;

export const useAttendanceExclusions = (params?: Record<string, any>) => {
  return useQuery<AttendanceExclusionResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getAttendanceExclusions(params),
    refetchOnWindowFocus: false,
  });
};

export const useAttendanceExclusionById = (
  id?: number | null,
) => {
  return useQuery<AttendanceExclusionResource>({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findAttendanceExclusionById(id as number),
    enabled: !!id,
    refetchOnWindowFocus: false,
  });
};
