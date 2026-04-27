import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import type {
  AdoptionFilters,
  AdoptionSummary,
  AdoptionUser,
  AdoptionSede,
  AdoptionModule,
  AdoptionCompliance,
  AdoptionChampions,
  AdoptionAlert,
  AdoptionTrendPoint,
} from "./adoption.interface";

const BASE = "/adoption-dashboard";

function toConfig(filters: AdoptionFilters): AxiosRequestConfig {
  const params: Record<string, unknown> = {};
  if (filters.date_from) params.date_from = filters.date_from;
  if (filters.date_to) params.date_to = filters.date_to;
  if (filters.sede_id) params.sede_id = filters.sede_id;
  if (filters.user_id) params.user_id = filters.user_id;
  if (filters.module) params.module = filters.module;
  if (filters.expected_ops_per_day)
    params.expected_ops_per_day = filters.expected_ops_per_day;
  return { params };
}

export async function getAdoptionSummary(filters: AdoptionFilters): Promise<AdoptionSummary> {
  const { data } = await api.get<AdoptionSummary>(`${BASE}/summary`, toConfig(filters));
  return data;
}

export async function getAdoptionUsers(filters: AdoptionFilters): Promise<AdoptionUser[]> {
  const { data } = await api.get<AdoptionUser[]>(`${BASE}/users`, toConfig(filters));
  return data;
}

export async function getAdoptionSedes(filters: AdoptionFilters): Promise<AdoptionSede[]> {
  const { data } = await api.get<AdoptionSede[]>(`${BASE}/sedes`, toConfig(filters));
  return data;
}

export async function getAdoptionModules(filters: AdoptionFilters): Promise<AdoptionModule[]> {
  const { data } = await api.get<AdoptionModule[]>(`${BASE}/modules`, toConfig(filters));
  return data;
}

export async function getAdoptionCompliance(filters: AdoptionFilters): Promise<AdoptionCompliance> {
  const { data } = await api.get<AdoptionCompliance>(`${BASE}/compliance`, toConfig(filters));
  return data;
}

export async function getAdoptionChampions(filters: AdoptionFilters): Promise<AdoptionChampions> {
  const { data } = await api.get<AdoptionChampions>(`${BASE}/champions`, toConfig(filters));
  return data;
}

export async function getAdoptionAlerts(filters: AdoptionFilters): Promise<AdoptionAlert[]> {
  const { data } = await api.get<AdoptionAlert[]>(`${BASE}/alerts`, toConfig(filters));
  return data;
}

export async function getAdoptionTrend(filters: AdoptionFilters): Promise<AdoptionTrendPoint[]> {
  const { data } = await api.get<AdoptionTrendPoint[]>(`${BASE}/trend`, toConfig(filters));
  return data;
}
