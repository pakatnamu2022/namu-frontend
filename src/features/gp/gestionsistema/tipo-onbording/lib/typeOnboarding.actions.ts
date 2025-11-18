import { AxiosRequestConfig } from "axios";

import { TYPE_ONBOARDING } from "./typeOnboarding.constants";
import {
  getTypeOnboardingProps,
  TypeOnboardingResource,
  TypeOnboardingResponse,
} from "./typeOnboarding.interface";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";

const { ENDPOINT } = TYPE_ONBOARDING;

export async function getTypeOnboarding({
  params,
}: getTypeOnboardingProps): Promise<TypeOnboardingResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<TypeOnboardingResponse>(ENDPOINT, config);
  return data;
}

export async function getAllTypeOnboarding(): Promise<
  TypeOnboardingResource[]
> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
    },
  };
  const { data } = await api.get<TypeOnboardingResource[]>(ENDPOINT, config);
  return data;
}

export async function findTypeOnboardingById(
  id: number
): Promise<TypeOnboardingResource> {
  const response = await api.get<TypeOnboardingResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeTypeOnboarding(
  data: any
): Promise<TypeOnboardingResource> {
  const response = await api.post<TypeOnboardingResource>(ENDPOINT, data);
  return response.data;
}

export async function updateTypeOnboarding(
  id: number,
  data: any
): Promise<TypeOnboardingResource> {
  const response = await api.put<TypeOnboardingResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteTypeOnboarding(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
