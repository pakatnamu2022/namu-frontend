import { api } from "@/core/api.ts";
import { GeneralResponse } from "@/shared/lib/response.interface.ts";
import type { AxiosRequestConfig } from "axios";
import {
  getSignersProps,
  SignerResource,
  SignerResponse,
} from "./signer.interface.ts";
import { SIGNER } from "./signer.constant.ts";

const { ENDPOINT } = SIGNER;

function toFormData(payload: Record<string, any>): FormData {
  const fd = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    fd.append(key, value as string | Blob);
  });
  return fd;
}

export async function getSigners({
  params,
}: getSignersProps): Promise<SignerResponse> {
  const config: AxiosRequestConfig = { params: { ...params } };
  const { data } = await api.get<SignerResponse>(ENDPOINT, config);
  return data;
}

export async function getAllSigners({
  params,
}: getSignersProps = {}): Promise<SignerResource[]> {
  const config: AxiosRequestConfig = { params: { all: true, ...params } };
  const { data } = await api.get<SignerResource[]>(ENDPOINT, config);
  return data;
}

export async function findSignerById(id: string): Promise<SignerResource> {
  const { data } = await api.get<SignerResource>(`${ENDPOINT}/${id}`);
  return data;
}

export async function storeSigner(
  payload: Record<string, any>,
): Promise<{ data: SignerResource }> {
  const { data } = await api.post<{ data: SignerResource }>(
    ENDPOINT,
    toFormData(payload),
  );
  return data;
}

export async function updateSigner(
  id: string,
  payload: Record<string, any>,
): Promise<{ data: SignerResource }> {
  const { data } = await api.post<{ data: SignerResource }>(
    `${ENDPOINT}/${id}`,
    toFormData({ ...payload, _method: "PUT" }),
  );
  return data;
}

export async function deleteSigner(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
