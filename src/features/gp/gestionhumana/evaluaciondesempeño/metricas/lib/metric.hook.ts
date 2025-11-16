import { useQuery } from "@tanstack/react-query";
import { MetricResource, MetricResponse } from "./metric.interface";
import { getAllMetrics, getMetric } from "./metric.actions";

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
