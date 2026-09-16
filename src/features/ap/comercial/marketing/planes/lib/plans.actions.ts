import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { PLANS } from "./plans.constants";
import { getPlansProps, PlansResource, PlansResponse } from "./plans.interface";
import { PlansSchema } from "./plans.schema";

const { ENDPOINT } = PLANS;

export async function getPlans({
  params,
}: getPlansProps): Promise<PlansResponse> {
  const config: AxiosRequestConfig = { params: { ...params } };
  const { data } = await api.get<PlansResponse>(ENDPOINT, config);
  return data;
}

export async function getAllPlans({
  params,
}: getPlansProps = {}): Promise<PlansResource[]> {
  const config: AxiosRequestConfig = {
    params: { all: true, ...params },
  };
  const { data } = await api.get<PlansResource[]>(ENDPOINT, config);
  return data;
}

export async function findPlansById(id: number): Promise<PlansResource> {
  const { data } = await api.get<PlansResource>(`${ENDPOINT}/${id}`);
  return data;
}

export async function storePlans(payload: PlansSchema): Promise<PlansResource> {
  const { data } = await api.post<PlansResource>(ENDPOINT, payload);
  return data;
}

export async function updatePlans(
  id: number,
  payload: Partial<PlansSchema>,
): Promise<PlansResource> {
  const { data } = await api.put<PlansResource>(`${ENDPOINT}/${id}`, payload);
  return data;
}

export async function deletePlans(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}

export async function activatePlan(id: number): Promise<PlansResource> {
  const { data } = await api.post<PlansResource>(`${ENDPOINT}/${id}/activate`);
  return data;
}

export async function completePlan(id: number): Promise<PlansResource> {
  const { data } = await api.post<PlansResource>(`${ENDPOINT}/${id}/complete`);
  return data;
}

export async function cancelPlan(id: number): Promise<PlansResource> {
  const { data } = await api.post<PlansResource>(`${ENDPOINT}/${id}/cancel`);
  return data;
}

export async function downloadPlanReportPdf(id: number): Promise<void> {
  const response = await api.get(`${ENDPOINT}/${id}/report/pdf`, {
    responseType: "blob",
  });

  const blob = new Blob([response.data], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `plan-marketing-${id}.pdf`);

  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
