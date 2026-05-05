import { useQuery } from "@tanstack/react-query";
import {
  getWorkerAttendanceRules,
  WorkerAttendanceRulesResponse,
} from "./worker-attendance-rules.actions.ts";

export const WORKER_ATTENDANCE_RULES_QUERY_KEY = "worker-attendance-rules";

export const useWorkerAttendanceRules = (workerId: number | null) => {
  return useQuery<WorkerAttendanceRulesResponse>({
    queryKey: [WORKER_ATTENDANCE_RULES_QUERY_KEY, workerId],
    queryFn: () => getWorkerAttendanceRules(workerId!),
    refetchOnWindowFocus: false,
    enabled: !!workerId,
  });
};
