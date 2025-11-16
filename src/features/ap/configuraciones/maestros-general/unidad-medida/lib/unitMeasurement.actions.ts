import { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { STATUS_ACTIVE } from "@/core/core.constants";
import { UNIT_MEASUREMENT } from "./unitMeasurement.constants";
import {
  getUnitMeasurementProps,
  UnitMeasurementResource,
  UnitMeasurementResponse,
} from "./unitMeasurement.interface";

const { ENDPOINT } = UNIT_MEASUREMENT;

export async function getUnitMeasurement({
  params,
}: getUnitMeasurementProps): Promise<UnitMeasurementResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<UnitMeasurementResponse>(ENDPOINT, config);
  return data;
}

export async function getAllUnitMeasurement({
  params,
}: getUnitMeasurementProps): Promise<UnitMeasurementResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
      ...params,
      status: STATUS_ACTIVE,
    },
  };
  const { data } = await api.get<UnitMeasurementResource[]>(ENDPOINT, config);
  return data;
}

export async function findUnitMeasurementById(
  id: number
): Promise<UnitMeasurementResource> {
  const response = await api.get<UnitMeasurementResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeUnitMeasurement(
  data: any
): Promise<UnitMeasurementResource> {
  const response = await api.post<UnitMeasurementResource>(ENDPOINT, data);
  return response.data;
}

export async function updateUnitMeasurement(
  id: number,
  data: any
): Promise<UnitMeasurementResource> {
  const response = await api.put<UnitMeasurementResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteUnitMeasurement(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
