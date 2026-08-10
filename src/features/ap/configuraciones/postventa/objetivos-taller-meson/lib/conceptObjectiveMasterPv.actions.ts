import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api.ts";
import {
  ConceptObjectivePvRequest,
  ConceptObjectivePvResource,
  getConceptObjectivePvProps,
} from "./conceptObjectiveMasterPv.interface.ts";
import { GeneralResponse } from "@/shared/lib/response.interface.ts";
import { CONCEPT_OBJECTIVE_PV } from "./conceptObjectiveMasterPv.constants.ts";

const { ENDPOINT } = CONCEPT_OBJECTIVE_PV;

export async function getAllConceptObjectivePv({
  params,
}: getConceptObjectivePvProps): Promise<ConceptObjectivePvResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
      ...params,
    },
  };
  const { data } = await api.get<ConceptObjectivePvResource[]>(
    ENDPOINT,
    config,
  );
  return data;
}

export async function updateOrCreateConceptObjectivePv(
  data: ConceptObjectivePvRequest,
): Promise<ConceptObjectivePvResource> {
  const response = await api.post<ConceptObjectivePvResource>(
    `${ENDPOINT}/updateOrCreate`,
    data,
  );
  return response.data;
}

export async function deleteConceptObjectivePv(
  id: number,
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
