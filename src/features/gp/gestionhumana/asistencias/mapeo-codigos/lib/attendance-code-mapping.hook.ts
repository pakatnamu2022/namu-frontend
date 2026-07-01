import { useQuery } from "@tanstack/react-query";
import {
  AttendanceCodeMappingResource,
  AttendanceCodeMappingResponse,
} from "./attendance-code-mapping.interface";
import {
  findAttendanceCodeMappingById,
  getAttendanceCodeMappings,
} from "./attendance-code-mapping.actions";
import { ATTENDANCE_CODE_MAPPING } from "./attendance-code-mapping.constants";

const { QUERY_KEY } = ATTENDANCE_CODE_MAPPING;

export const useAttendanceCodeMappings = (params?: Record<string, any>) => {
  return useQuery<AttendanceCodeMappingResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getAttendanceCodeMappings(params),
    refetchOnWindowFocus: false,
  });
};

export const useAttendanceCodeMappingById = (id?: number | null) => {
  return useQuery<AttendanceCodeMappingResource>({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findAttendanceCodeMappingById(id as number),
    enabled: !!id,
    refetchOnWindowFocus: false,
  });
};
