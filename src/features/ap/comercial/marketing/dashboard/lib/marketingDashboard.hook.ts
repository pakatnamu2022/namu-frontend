import { useQuery } from "@tanstack/react-query";
import {
  getMarketingDashboard,
  getMarketingDashboardMonthly,
} from "./marketingDashboard.actions";
import { MARKETING_DASHBOARD } from "./marketingDashboard.constants";

const { QUERY_KEY } = MARKETING_DASHBOARD;

export const useMarketingDashboard = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getMarketingDashboard(params),
    refetchOnWindowFocus: false,
  });
};

export const useMarketingDashboardMonthly = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: [QUERY_KEY, "monthly", params],
    queryFn: () => getMarketingDashboardMonthly(params),
    refetchOnWindowFocus: false,
  });
};
