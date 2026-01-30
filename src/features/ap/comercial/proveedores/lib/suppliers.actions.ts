import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { SUPPLIERS } from "./suppliers.constants";
import {
  getSuppliersProps,
  SuppliersRequest,
  SuppliersResource,
  SuppliersResponse,
} from "./suppliers.interface";
import { TYPE_BUSINESS_PARTNERS } from "@/core/core.constants";

const { ENDPOINT } = SUPPLIERS;

export async function getSuppliers({
  params,
}: getSuppliersProps): Promise<SuppliersResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      type: [TYPE_BUSINESS_PARTNERS.PROVEEDOR, TYPE_BUSINESS_PARTNERS.AMBOS],
    },
  };
  const { data } = await api.get<SuppliersResponse>(ENDPOINT, config);
  return data;
}

export async function getAllSuppliers({
  params,
}: getSuppliersProps): Promise<SuppliersResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      all: true,
      type: [TYPE_BUSINESS_PARTNERS.PROVEEDOR, TYPE_BUSINESS_PARTNERS.AMBOS],
    },
  };
  const { data } = await api.get<SuppliersResource[]>(ENDPOINT, config);
  return data;
}

export async function getSuppliersById(id: number): Promise<SuppliersResource> {
  const { data } = await api.get<SuppliersResource>(`${ENDPOINT}/${id}`);
  return data;
}

export async function findSuppliersById(
  id: number,
): Promise<SuppliersResource> {
  const response = await api.get<SuppliersResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeSuppliers(
  payload: SuppliersRequest,
): Promise<SuppliersResource> {
  const { data } = await api.post<SuppliersResource>(ENDPOINT, payload);
  return data;
}

export async function updateSuppliers(
  id: number,
  payload: SuppliersRequest,
): Promise<SuppliersResource> {
  const { data } = await api.put<SuppliersResource>(
    `${ENDPOINT}/${id}`,
    payload,
  );
  return data;
}

export async function deleteSuppliers(
  id: number,
  type?: string,
): Promise<GeneralResponse> {
  const payload = { type: type || TYPE_BUSINESS_PARTNERS.PROVEEDOR };
  const { data } = await api.patch<GeneralResponse>(
    `${ENDPOINT}/${id}/remove-type`,
    payload,
  );
  return data;
}
