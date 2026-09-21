import { api } from "@/core/api";
import type { AxiosRequestConfig } from "axios";
import {
  LifePolicyRequest,
  LifePolicyResource,
  LifePolicyResponse,
  LifePolicyStoreResult,
  LifePolicyWorkerRequest,
} from "./life-policy.interface";
import { LIFE_POLICY } from "./life-policy.constants";

const { ENDPOINT } = LIFE_POLICY;

// Los endpoints envuelven el recurso en `data`; algunos anidan otro `data` (JsonResource).
const unwrap = <T>(response: any): T => {
  const inner = response?.data ?? response;
  return (inner?.data ?? inner) as T;
};

export async function getLifePolicies(
  params?: Record<string, any>,
): Promise<LifePolicyResponse> {
  const config: AxiosRequestConfig = { params };
  const { data } = await api.get<LifePolicyResponse>(ENDPOINT, config);
  return data;
}

export async function getLifePolicy(id: number): Promise<LifePolicyResource> {
  const { data } = await api.get<any>(`${ENDPOINT}/${id}`);
  return unwrap<LifePolicyResource>(data);
}

export async function storeLifePolicy(
  payload: LifePolicyRequest,
): Promise<{ policy: LifePolicyResource; skipped: LifePolicyStoreResult["skipped"] }> {
  const { data } = await api.post<any>(ENDPOINT, payload);
  const result = data?.data ?? data;
  return {
    policy: unwrap<LifePolicyResource>(result?.policy),
    skipped: result?.skipped ?? [],
  };
}

export async function addLifePolicyWorker(
  id: number,
  payload: LifePolicyWorkerRequest,
): Promise<LifePolicyResource> {
  const { data } = await api.post<any>(`${ENDPOINT}/${id}/workers`, payload);
  return unwrap<LifePolicyResource>(data);
}
