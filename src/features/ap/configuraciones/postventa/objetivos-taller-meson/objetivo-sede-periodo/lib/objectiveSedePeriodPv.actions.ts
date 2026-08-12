import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api.ts";
import {
  ObjectiveSedePeriodPvRequest,
  ObjectiveSedePeriodPvResource,
  ObjectiveSedePeriodPvResponse,
  getObjectiveSedePeriodPvProps,
} from "./objectiveSedePeriodPv.interface.ts";
import { GeneralResponse } from "@/shared/lib/response.interface.ts";
import { OBJECTIVE_SEDE_PERIOD_PV } from "./objectiveSedePeriodPv.constants.ts";

const { ENDPOINT } = OBJECTIVE_SEDE_PERIOD_PV;

export async function getObjectiveSedePeriodPv({
  params,
}: getObjectiveSedePeriodPvProps): Promise<ObjectiveSedePeriodPvResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<ObjectiveSedePeriodPvResponse>(
    ENDPOINT,
    config,
  );
  return data;
}

export async function getAllObjectiveSedePeriodPv({
  params,
}: getObjectiveSedePeriodPvProps): Promise<ObjectiveSedePeriodPvResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
      ...params,
    },
  };
  const { data } = await api.get<ObjectiveSedePeriodPvResource[]>(
    ENDPOINT,
    config,
  );
  return data;
}

export async function findObjectiveSedePeriodPvById(
  id: number,
): Promise<ObjectiveSedePeriodPvResource> {
  const { data } = await api.get<{ data: ObjectiveSedePeriodPvResource }>(
    `${ENDPOINT}/${id}`,
  );
  return (data as any).data ?? data;
}

export async function storeObjectiveSedePeriodPv(
  data: ObjectiveSedePeriodPvRequest,
): Promise<ObjectiveSedePeriodPvResource> {
  const response = await api.post<{ data: ObjectiveSedePeriodPvResource }>(
    ENDPOINT,
    data,
  );
  return (response.data as any).data ?? response.data;
}

export async function updateObjectiveSedePeriodPv(
  id: number,
  data: ObjectiveSedePeriodPvRequest,
): Promise<ObjectiveSedePeriodPvResource> {
  const response = await api.put<{ data: ObjectiveSedePeriodPvResource }>(
    `${ENDPOINT}/${id}`,
    data,
  );
  return (response.data as any).data ?? response.data;
}

export async function deleteObjectiveSedePeriodPv(
  id: number,
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}

export async function bulkGenerateObjectiveSedePeriodPv(data: {
  year: number;
  month: number;
}): Promise<GeneralResponse> {
  const response = await api.post<GeneralResponse>(
    `${ENDPOINT}/bulk-generate`,
    data,
  );
  return response.data;
}
