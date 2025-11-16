import { AxiosRequestConfig } from "axios";
import {
  getSupplierOrderTypeProps,
  SupplierOrderTypeResource,
  SupplierOrderTypeResponse,
} from "./supplierOrderType.interface";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { STATUS_ACTIVE } from "@/core/core.constants";
import { SUPPLIER_ORDER_TYPE } from "./supplierOrderType.constants";
import { AP_MASTER_COMERCIAL } from "@/features/ap/lib/ap.constants";

const { ENDPOINT } = SUPPLIER_ORDER_TYPE;

export async function getSupplierOrderType({
  params,
}: getSupplierOrderTypeProps): Promise<SupplierOrderTypeResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      type: AP_MASTER_COMERCIAL.SUPPLIER_ORDER_TYPE,
    },
  };
  const { data } = await api.get<SupplierOrderTypeResponse>(ENDPOINT, config);
  return data;
}

export async function getAllSupplierOrderType({
  params,
}: getSupplierOrderTypeProps): Promise<SupplierOrderTypeResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
      type: AP_MASTER_COMERCIAL.SUPPLIER_ORDER_TYPE,
      ...params,
      status: STATUS_ACTIVE,
    },
  };
  const { data } = await api.get<SupplierOrderTypeResource[]>(ENDPOINT, config);
  return data;
}

export async function findSupplierOrderTypeById(
  id: number
): Promise<SupplierOrderTypeResource> {
  const response = await api.get<SupplierOrderTypeResource>(
    `${ENDPOINT}/${id}`
  );
  return response.data;
}

export async function storeSupplierOrderType(
  data: any
): Promise<SupplierOrderTypeResource> {
  const response = await api.post<SupplierOrderTypeResource>(ENDPOINT, data);
  return response.data;
}

export async function updateSupplierOrderType(
  id: number,
  data: any
): Promise<SupplierOrderTypeResource> {
  const response = await api.put<SupplierOrderTypeResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteSupplierOrderType(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
