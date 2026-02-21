import { useQuery } from "@tanstack/react-query";
import { AttendanceRuleResource, AttendanceRuleResponse } from "./attendance-rule.interface";
import { findAttendanceRuleById, getAttendanceRuleCodes, getAttendanceRules } from "./attendance-rule.actions";
import { ATTENDANCE_RULE } from "./attendance-rule.constant";

const { QUERY_KEY } = ATTENDANCE_RULE;

export const useAttendanceRules = (params?: Record<string, any>) => {
  return useQuery<AttendanceRuleResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getAttendanceRules(params),
    refetchOnWindowFocus: false,
  });
};

export const useAttendanceRuleById = (id: number) => {
  return useQuery<AttendanceRuleResource>({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findAttendanceRuleById(id),
    refetchOnWindowFocus: false,
    enabled: !!id,
  });
};

export const useAttendanceRuleCodes = () => {
  return useQuery<string[]>({
    queryKey: [`${QUERY_KEY}-codes`],
    queryFn: getAttendanceRuleCodes,
    refetchOnWindowFocus: false,
  });
};
