import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api.ts";
import {
  ConceptObjectivePeriodPvRequest,
  ConceptObjectivePeriodPvResource,
  getConceptObjectivePeriodPvProps,
} from "./conceptObjectivePeriodPv.interface.ts";
import { GeneralResponse } from "@/shared/lib/response.interface.ts";
import { CONCEPT_OBJECTIVE_PERIOD_PV } from "./conceptObjectivePeriodPv.constants.ts";

const { ENDPOINT } = CONCEPT_OBJECTIVE_PERIOD_PV;

export async function getAllConceptObjectivePeriodPv({
  params,
}: getConceptObjectivePeriodPvProps): Promise<
  ConceptObjectivePeriodPvResource[]
> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
      ...params,
    },
  };
  const { data } = await api.get<ConceptObjectivePeriodPvResource[]>(
    ENDPOINT,
    config,
  );
  return data;
}

export async function findConceptObjectivePeriodPvById(
  id: number,
): Promise<ConceptObjectivePeriodPvResource> {
  const { data } = await api.get<{ data: ConceptObjectivePeriodPvResource }>(
    `${ENDPOINT}/${id}`,
  );
  return (data as any).data ?? data;
}

export async function storeConceptObjectivePeriodPv(
  data: ConceptObjectivePeriodPvRequest,
): Promise<ConceptObjectivePeriodPvResource> {
  const response = await api.post<{ data: ConceptObjectivePeriodPvResource }>(
    ENDPOINT,
    data,
  );
  return (response.data as any).data ?? response.data;
}

export async function updateConceptObjectivePeriodPv(
  id: number,
  data: ConceptObjectivePeriodPvRequest,
): Promise<ConceptObjectivePeriodPvResource> {
  const response = await api.put<{ data: ConceptObjectivePeriodPvResource }>(
    `${ENDPOINT}/${id}`,
    data,
  );
  return (response.data as any).data ?? response.data;
}

export async function deleteConceptObjectivePeriodPv(
  id: number,
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
