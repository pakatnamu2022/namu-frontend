import { useQuery } from "@tanstack/react-query";
import {
  RecruitmentProcessResource,
  RecruitmentProcessResponse,
} from "./recruitmentProcess.interface.ts";
import {
  getAllRecruitmentProcesses,
  getRecruitmentProcesses,
} from "./recruitmentProcess.actions.ts";
import { RECRUITMENT_PROCESS } from "./recruitmentProcess.constant.ts";

const { QUERY_KEY } = RECRUITMENT_PROCESS;

export const useRecruitmentProcesses = (params?: Record<string, any>) => {
  return useQuery<RecruitmentProcessResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getRecruitmentProcesses({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllRecruitmentProcesses = (params?: Record<string, any>) => {
  return useQuery<RecruitmentProcessResource[]>({
    queryKey: [QUERY_KEY + "All", params],
    queryFn: () => getAllRecruitmentProcesses({ params }),
    refetchOnWindowFocus: false,
  });
};
