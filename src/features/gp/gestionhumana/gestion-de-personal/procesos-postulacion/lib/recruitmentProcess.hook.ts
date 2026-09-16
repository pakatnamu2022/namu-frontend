import { useQuery } from "@tanstack/react-query";
import {
  RecruitmentProcessCoverage,
  RecruitmentProcessHistoryEntry,
  RecruitmentProcessResource,
  RecruitmentProcessResponse,
} from "./recruitmentProcess.interface.ts";
import {
  getAllRecruitmentProcesses,
  getRecruitmentProcesses,
  getRecruitmentProcessCoverage,
  getRecruitmentProcessHistory,
} from "./recruitmentProcess.actions.ts";
import { RECRUITMENT_PROCESS } from "./recruitmentProcess.constant.ts";

const { QUERY_KEY } = RECRUITMENT_PROCESS;

export const useRecruitmentProcesses = (params?: Record<string, any>) => {
  return useQuery<RecruitmentProcessResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getRecruitmentProcesses({ params }),
  });
};

export const useAllRecruitmentProcesses = (params?: Record<string, any>) => {
  return useQuery<RecruitmentProcessResource[]>({
    queryKey: [QUERY_KEY + "All", params],
    queryFn: () => getAllRecruitmentProcesses({ params }),
  });
};

export const useRecruitmentProcessHistory = (id: number | null) => {
  return useQuery<RecruitmentProcessHistoryEntry[]>({
    queryKey: [QUERY_KEY + "History", id],
    queryFn: () => getRecruitmentProcessHistory(id as number),
    enabled: id !== null,
  });
};

export const useRecruitmentProcessCoverage = (id: number | null) => {
  return useQuery<RecruitmentProcessCoverage>({
    queryKey: [QUERY_KEY + "Coverage", id],
    queryFn: () => getRecruitmentProcessCoverage(id as number),
    enabled: id !== null,
  });
};
