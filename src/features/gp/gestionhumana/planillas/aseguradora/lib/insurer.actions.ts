import { api } from "@/core/api.ts";
import { INSURER } from "./insurer.constants.ts";
import {
  SuppliersRequest,
  SuppliersResource,
  SuppliersResponse,
} from "@/features/ap/comercial/proveedores/lib/suppliers.interface.ts";
import type { AxiosRequestConfig } from "axios";
import { GeneralResponse } from "@/shared/lib/response.interface.ts";

const { ENDPOINT } = INSURER;

export async function getInsurers(
  params?: Record<string, any>,
): Promise<SuppliersResponse> {
  const config: AxiosRequestConfig = {
    params: { ...params, is_insurance: 1 },
  };
  const { data } = await api.get<SuppliersResponse>(ENDPOINT, config);
  return data;
}

export async function findInsurerById(id: number): Promise<SuppliersResource> {
  const { data } = await api.get<SuppliersResource>(`${ENDPOINT}/${id}`);
  return data;
}

export async function storeInsurer(
  payload: SuppliersRequest,
): Promise<SuppliersResource> {
  const { data } = await api.post<SuppliersResource>(ENDPOINT, {
    ...payload,
    is_insurance: true,
  });
  return data;
}

export async function updateInsurer(
  id: number,
  payload: SuppliersRequest,
): Promise<SuppliersResource> {
  const { data } = await api.put<SuppliersResource>(`${ENDPOINT}/${id}`, {
    ...payload,
    is_insurance: true,
  });
  return data;
}

export async function deleteInsurer(id: number): Promise<GeneralResponse> {
  const { data } = await api.patch<GeneralResponse>(
    `${ENDPOINT}/${id}/remove-type`,
    { is_insurance: true },
  );
  return data;
}
