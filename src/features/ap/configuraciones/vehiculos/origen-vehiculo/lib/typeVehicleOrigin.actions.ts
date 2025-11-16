import { AxiosRequestConfig } from "axios";
import {
  getTypeVehicleOriginProps,
  TypeVehicleOriginResource,
  TypeVehicleOriginResponse,
} from "./typeVehicleOrigin.interface";
import { api } from "@/src/core/api";
import { GeneralResponse } from "@/src/shared/lib/response.interface";
import { VEHICLE_ORIGIN } from "./typeVehicleOrigin.constants";
import { AP_MASTER_COMERCIAL } from "@/src/features/ap/lib/ap.constants";

const { ENDPOINT } = VEHICLE_ORIGIN;

export async function getTypeVehicleOrigin({
  params,
}: getTypeVehicleOriginProps): Promise<TypeVehicleOriginResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      type: AP_MASTER_COMERCIAL.VEHICLE_ORIGIN,
    },
  };
  const { data } = await api.get<TypeVehicleOriginResponse>(ENDPOINT, config);
  return data;
}

export async function getAllTypeVehicleOrigin({
  params,
}: getTypeVehicleOriginProps): Promise<TypeVehicleOriginResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
      ...params,
    },
  };
  const { data } = await api.get<TypeVehicleOriginResource[]>(ENDPOINT, config);
  return data;
}

export async function findTypeVehicleOriginById(
  id: number
): Promise<TypeVehicleOriginResource> {
  const response = await api.get<TypeVehicleOriginResource>(
    `${ENDPOINT}/${id}`
  );
  return response.data;
}

export async function storeTypeVehicleOrigin(
  data: any
): Promise<TypeVehicleOriginResource> {
  const response = await api.post<TypeVehicleOriginResource>(ENDPOINT, data);
  return response.data;
}

export async function updateTypeVehicleOrigin(
  id: number,
  data: any
): Promise<TypeVehicleOriginResource> {
  const response = await api.put<TypeVehicleOriginResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteTypeVehicleOrigin(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
