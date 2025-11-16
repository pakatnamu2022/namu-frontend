import { useQuery } from "@tanstack/react-query";
import { MetricResource, MetricResponse } from "./team.interface";
import { getAllMetrics, getMetric, getLeaderDashboard } from "./team.actions";
import { TeamDashboardResponse } from "./team-dashboard.interface";

export const useMetrics = (params?: Record<string, any>) => {
  return useQuery<MetricResponse>({
    queryKey: ["metric", params],
    queryFn: () => getMetric({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllMetrics = () => {
  return useQuery<MetricResource[]>({
    queryKey: ["metricAll"],
    queryFn: () => getAllMetrics(),
    refetchOnWindowFocus: false,
  });
};

export const useLeaderDashboard = (evaluationId: number) => {
  return useQuery<TeamDashboardResponse>({
    queryKey: ["leaderDashboard", evaluationId],
    queryFn: () => getLeaderDashboard(evaluationId),
    refetchOnWindowFocus: false,
    enabled: !!evaluationId,
  });
};
