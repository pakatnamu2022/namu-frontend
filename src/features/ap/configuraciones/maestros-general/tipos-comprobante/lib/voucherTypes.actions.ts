import type { AxiosRequestConfig } from "axios";
import { STATUS_ACTIVE } from "@/core/core.constants";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { VOUCHER_TYPE } from "./voucherTypes.constants";
import {
  getVoucherTypesProps,
  VoucherTypesResource,
  VoucherTypesResponse,
} from "./voucherTypes.interface";
import { AP_MASTER_COMERCIAL } from "../../../../lib/ap.constants";

const { ENDPOINT } = VOUCHER_TYPE;

export async function getVoucherTypes({
  params,
}: getVoucherTypesProps): Promise<VoucherTypesResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      type: AP_MASTER_COMERCIAL.VOUCHER_TYPE,
    },
  };
  const { data } = await api.get<VoucherTypesResponse>(ENDPOINT, config);
  return data;
}

export async function getAllVoucherTypes({
  params,
}: getVoucherTypesProps): Promise<VoucherTypesResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
      ...params,
      type: AP_MASTER_COMERCIAL.VOUCHER_TYPE,
      status: STATUS_ACTIVE,
    },
  };
  const { data } = await api.get<VoucherTypesResource[]>(ENDPOINT, config);
  return data;
}

export async function findVoucherTypesById(
  id: number
): Promise<VoucherTypesResource> {
  const response = await api.get<VoucherTypesResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeVoucherTypes(
  data: any
): Promise<VoucherTypesResource> {
  const response = await api.post<VoucherTypesResource>(ENDPOINT, data);
  return response.data;
}

export async function updateVoucherTypes(
  id: number,
  data: any
): Promise<VoucherTypesResource> {
  const response = await api.put<VoucherTypesResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteVoucherTypes(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
