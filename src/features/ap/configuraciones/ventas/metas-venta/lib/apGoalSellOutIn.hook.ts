import { useQuery } from "@tanstack/react-query";
import { AP_GOAL_SELL_OUT_IN } from "./apGoalSellOutIn.constants";
import {
  ApGoalSellOutInReportResponse,
  ApGoalSellOutInResponse,
} from "./apGoalSellOutIn.interface";
import {
  findApGoalSellOutInById,
  getApGoalSellOutIn,
  getApGoalSellOutInReport,
} from "./apGoalSellOutIn.actions";

const { QUERY_KEY } = AP_GOAL_SELL_OUT_IN;

export const useApGoalSellOutIn = (params?: Record<string, any>) => {
  return useQuery<ApGoalSellOutInResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getApGoalSellOutIn({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useApGoalSellOutInById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findApGoalSellOutInById(id),
    refetchOnWindowFocus: false,
  });
};

export const useApGoalSellOutInReport = (params?: Record<string, any>) => {
  return useQuery<ApGoalSellOutInReportResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getApGoalSellOutInReport({ params }),
    refetchOnWindowFocus: false,
  });
};
