import type { AxiosRequestConfig } from "axios";
import {
  GearShiftTypeResource,
  GearShiftTypeResponse,
  getGearShiftTypeProps,
} from "./gearShiftType.interface";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { STATUS_ACTIVE } from "@/core/core.constants";
import { TYPE_TRANSMISSION } from "./gearShiftType.constants";
import { AP_MASTER_COMERCIAL } from "@/features/ap/lib/ap.constants";

const { ENDPOINT } = TYPE_TRANSMISSION;

export async function getGearShiftType({
  params,
}: getGearShiftTypeProps): Promise<GearShiftTypeResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      type: AP_MASTER_COMERCIAL.TRANSMISION_VEHICLE,
    },
  };
  const { data } = await api.get<GearShiftTypeResponse>(ENDPOINT, config);
  return data;
}

export async function getAllGearShiftType({
  params,
}: getGearShiftTypeProps): Promise<GearShiftTypeResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
      ...params,
      type: AP_MASTER_COMERCIAL.TRANSMISION_VEHICLE,
      status: STATUS_ACTIVE,
    },
  };
  const { data } = await api.get<GearShiftTypeResource[]>(ENDPOINT, config);
  return data;
}

export async function findGearShiftTypeById(
  id: number
): Promise<GearShiftTypeResource> {
  const response = await api.get<GearShiftTypeResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeGearShiftType(
  data: any
): Promise<GearShiftTypeResource> {
  const response = await api.post<GearShiftTypeResource>(ENDPOINT, data);
  return response.data;
}

export async function updateGearShiftType(
  id: number,
  data: any
): Promise<GearShiftTypeResource> {
  const response = await api.put<GearShiftTypeResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteGearShiftType(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
