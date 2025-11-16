import { api } from "@/core/api";
import type { AxiosRequestConfig } from "axios";
import { SUNAT_CONCEPTS } from "./sunatConcepts.constants";
import { SunatConceptsResource } from "./sunatConcepts.interface";
import { STATUS_ACTIVE } from "@/core/core.constants";

const { ENDPOINT } = SUNAT_CONCEPTS;

export async function getAllSunatConcepts(
  params: Record<string, any> = {}
): Promise<SunatConceptsResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
      ...params,
      status: STATUS_ACTIVE,
    },
  };
  const { data } = await api.get<SunatConceptsResource[]>(ENDPOINT, config);
  return data;
}
