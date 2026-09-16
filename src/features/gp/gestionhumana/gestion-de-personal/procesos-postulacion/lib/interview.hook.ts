import { useQuery } from "@tanstack/react-query";
import { InterviewResponse, ProcessCompetence } from "./interview.interface.ts";
import { getInterviews, getProcessCompetences } from "./interview.actions.ts";
import { INTERVIEW } from "./interview.constant.ts";

const { QUERY_KEY } = INTERVIEW;

export const useInterviews = (
  params?: Record<string, any>,
  options?: { enabled?: boolean },
) => {
  return useQuery<InterviewResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getInterviews({ params }),
    enabled: options?.enabled ?? true,
    refetchOnWindowFocus: false,
  });
};

export const useProcessCompetences = (processId: number | null) => {
  return useQuery<ProcessCompetence[]>({
    queryKey: [QUERY_KEY + "ProcessCompetences", processId],
    queryFn: () => getProcessCompetences(processId as number),
    enabled: processId !== null,
    refetchOnWindowFocus: false,
  });
};
