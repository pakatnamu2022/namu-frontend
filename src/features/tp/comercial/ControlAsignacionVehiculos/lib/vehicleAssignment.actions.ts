import { api } from "@/core/api";
import { VEHICLEASSIGNMENTCONTROL } from "./vehicleAssignment.constants";
import {
  getVehicleAssignmentControlProps,
  VehicleAssignmentControlResource,
  VehicleAssignmentControlResponse,
} from "./vehicleAssignment.interface";
import { AxiosRequestConfig } from "axios";
import { GeneralResponse } from "@/shared/lib/response.interface";

const { ENDPOINT } = VEHICLEASSIGNMENTCONTROL;

export interface FormDataResponse {
  drivers: Array<{
    id: string;
    nombre_completo: string;
    vat: string;
  }>;
  tractors: Array<{
    id: string;
    placa: string;
  }>;
}

export interface DriverSearchResponse {
  success: boolean;
  data: Array<{
    id: string;
    nombre_completo: string;
    vat: string;
  }>;
  total: number;
}

export interface DriverSearchParams {
  search?: string;
  limit?: number;
}

export async function getFormData(): Promise<FormDataResponse> {
  const { data } = await api.get<FormDataResponse>(`${ENDPOINT}/form/data`);
  return data;
}

export async function searchDrivers(
  params?: DriverSearchParams,
): Promise<DriverSearchResponse> {
  const url = `${ENDPOINT}/drivers/search`;

  const response = await api.get<DriverSearchResponse>(url, {
    params: {
      search: params?.search || "",
      limit: params?.limit || 50,
    },
  });

  return response.data;
}

export async function getVehicleAssignment({
  params,
}: getVehicleAssignmentControlProps): Promise<VehicleAssignmentControlResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };

  try {
    const response = await api.get<VehicleAssignmentControlResponse>(
      ENDPOINT,
      config,
    );

    if (response.data && (response.data as any).original) {
      const apiResponse = response.data as any;
      return apiResponse.original;
    }
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        `Server Error: ${error.response.data.message || "Unknown error"}`,
      );
    } else if (error.request) {
      throw new Error("Network Error: No response from server");
    } else {
      throw new Error(`Request Error: ${error.message}`);
    }
  }
}

export async function deleteVehicleAssignment(
  id: number,
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}

export async function findVehicleAssignmentById(
  id: number,
): Promise<VehicleAssignmentControlResource> {
  const response = await api.get<VehicleAssignmentControlResource>(
    `${ENDPOINT}/${id}`,
  );
  return response.data;
}

export async function storeVehicleAssignment(
  data: any,
): Promise<VehicleAssignmentControlResponse> {
  const response = await api.post<VehicleAssignmentControlResponse>(
    `${ENDPOINT}`,
    data,
  );
  return response.data;
}

export async function updateVehicleAssignment(
  id: number,
  data: any,
): Promise<VehicleAssignmentControlResponse> {
  const response = await api.put<VehicleAssignmentControlResponse>(
    `${ENDPOINT}/${id}`,
    data,
  );
  return response.data;
}
