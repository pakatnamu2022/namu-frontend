import { api } from "@/core/api";
import { MARKETING_DASHBOARD } from "./marketingDashboard.constants";
import {
  MarketingDashboardMonthlyResponse,
  MarketingDashboardResponse,
} from "./marketingDashboard.interface";

const { ENDPOINT, ENDPOINT_MONTHLY } = MARKETING_DASHBOARD;

export async function getMarketingDashboard(
  params?: Record<string, any>,
): Promise<MarketingDashboardResponse> {
  const { data } = await api.get<MarketingDashboardResponse>(ENDPOINT, { params });
  return data;
}

export async function getMarketingDashboardMonthly(
  params?: Record<string, any>,
): Promise<MarketingDashboardMonthlyResponse> {
  const { data } = await api.get<MarketingDashboardMonthlyResponse>(
    ENDPOINT_MONTHLY,
    { params },
  );
  return data;
}
