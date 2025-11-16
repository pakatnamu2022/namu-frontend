import { GeneralResponse } from "@/src/shared/lib/response.interface";
import { AxiosRequestConfig } from "axios";
import {
  getMetricsProps,
  MetricResource,
  MetricResponse,
} from "./team.interface";
import { api } from "@/src/core/api";
import { METRIC } from "./team.constant";
import { TeamDashboardResponse } from "./team-dashboard.interface";

const { ENDPOINT } = METRIC;

export async function getMetric({
  params,
}: getMetricsProps): Promise<MetricResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<MetricResponse>(ENDPOINT, config);
  return data;
}

export async function getAllMetrics(): Promise<MetricResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all metrics
    },
  };
  const { data } = await api.get<MetricResource[]>(ENDPOINT, config);
  return data;
}

export async function findMetricById(id: string): Promise<MetricResource> {
  const response = await api.get<MetricResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeMetric(data: any): Promise<MetricResponse> {
  const response = await api.post<MetricResponse>(ENDPOINT, data);
  return response.data;
}

export async function updateMetric(
  id: string,
  data: any
): Promise<MetricResponse> {
  const response = await api.put<MetricResponse>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteMetric(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}

export async function getLeaderDashboard(
  evaluationId: number
): Promise<TeamDashboardResponse> {
  const { data } = await api.get<TeamDashboardResponse>(
    `/gp/gh/performanceEvaluation/leader-dashboard/${evaluationId}`
  );
  return data;
}
