import { api } from "@/core/api";
import {
  ApiResponse,
  GetTripsProps,
  TripStatus,
} from "./travelControl.interface";
import {
  TravelControlResource,
  TravelControlResponse,
} from "./travelControl.interface";
import { TRAVEL_CONTROL } from "../controlViajesType/travelControl.constants";
import { AxiosRequestConfig } from "axios";

const { ENDPOINT } = TRAVEL_CONTROL;

export async function getTravels({
  params,
  search,
  status,
  page = 1,
  per_page = 15,
}: GetTripsProps): Promise<TravelControlResponse> {
  const queryParams: Record<string, any> = {
    page,
    per_page,
    ...params,
  };

  if (search) queryParams.search = search;
  if (status && status !== "all") {
    queryParams.status = status;
  }

  const config: AxiosRequestConfig = {
    params: queryParams,
  };

  const response = await api.get<TravelControlResponse>(ENDPOINT, config);
  return response.data;
}

export async function findTravelById(
  id: string
): Promise<TravelControlResource> {
  const response = await api.get<{ data: TravelControlResource }>(
    `/${ENDPOINT}/${id}`
  );
  return response.data.data;
}

export async function updateTravel(
  id: string,
  data: any
): Promise<TravelControlResource> {
  const response = await api.put<{ data: TravelControlResource }>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data.data;
}

export async function startRoute(params: {
  id: string;
  mileage: number;
  notes?: string;
}): Promise<TravelControlResource> {
  const response = await api.post<{ data: TravelControlResource }>(
    `${ENDPOINT}/${params.id}/start`,
    {
      mileage: params.mileage,
      notes: params.notes,
    }
  );
  return response.data.data;
}

export async function endRoute(params: {
  id: string;
  mileage: number;
  notes?: string;
  tonnage?: number;
}): Promise<TravelControlResource> {
  const response = await api.post<{ data: TravelControlResource }>(
    `${ENDPOINT}/${params.id}/end`,
    {
      mileage: params.mileage,
      notes: params.notes,
      tonnage: params.tonnage,
    }
  );
  return response.data.data;
}

export async function registerFuel(params: {
  id: string;
  kmFactor: number;
  notes?: string;
  invoice_travel?: string;
  documentNumber?: string;
  vatNumber?: string;
}): Promise<{ travel: TravelControlResource; fuel: any }> {
  try {
    const response = await api.post<{
      data: {
        travel: TravelControlResource;
        fuel: any;
      };
    }>(`${ENDPOINT}/${params.id}/fuel`, {
      kmFactor: params.kmFactor,
      notes: params.notes,
      invoice_travel: params.invoice_travel,
      vatNumber: null,
    });
    return response.data.data;
  } catch (error: any) {
    console.error("Error in registerFuel:", error);

    if (error.response) {
      throw new Error(
        `Server Error: ${error.response.data.message || "Unknown error"}`
      );
    } else if (error.request) {
      throw new Error("Network Error: No response from server");
    } else {
      throw new Error(`Request Error: ${error.message}`);
    }
  }
}

export async function changeStatus(params: {
  id: string;
  state: TripStatus;
  notes?: string;
}): Promise<TravelControlResource> {
  const response = await api.post<{ data: TravelControlResource }>(
    `${ENDPOINT}/${params.id}/state`,
    {
      state: params.state,
      notes: params.notes,
    }
  );
  return response.data.data;
}

export async function getDriverRegistries(
  tripId: string
): Promise<ApiResponse<any[]>> {
  const response = await api.get<{ data: any[] }>(
    `${ENDPOINT}/${tripId}/records`
  );
  return response.data;
}

export async function getAvailableStatuses(): Promise<ApiResponse<any[]>> {
  const response = await api.get<{ data: any[] }>(`${ENDPOINT}/filters/states`);
  return response.data;
}

export async function validateMileage(vehicleId: string | number): Promise<
  ApiResponse<{
    ultimo_kilometraje: number;
    mensaje: string;
  }>
> {
  const response = await api.get<
    ApiResponse<{
      ultimo_kilometraje: number;
      mensaje: string;
    }>
  >(`${ENDPOINT}/validate-mileage/${vehicleId}`);

  return response.data;
}

export async function getLastMileage(vehicleId: string): Promise<number> {
  try {
    const data = await validateMileage(vehicleId);
    return data.data?.ultimo_kilometraje || 0;
  } catch (error) {
    console.error("Error obteniendo último kilometraje:", error);
    return 0;
  }
}
