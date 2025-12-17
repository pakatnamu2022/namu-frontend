import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { HOTEL_AGREEMENT } from "./hotelAgreement.constants";
import {
  getHotelAgreementProps,
  HotelAgreementResource,
  HotelAgreementResponse,
} from "./hotelAgreement.interface";
import {
  HotelAgreementSchema,
  HotelAgreementSchemaUpdate,
} from "./hotelAgreement.schema";

const { ENDPOINT } = HOTEL_AGREEMENT;

export async function getHotelAgreement({
  params,
}: getHotelAgreementProps): Promise<HotelAgreementResponse> {
  const config: AxiosRequestConfig = {
    params,
  };
  const { data } = await api.get<HotelAgreementResponse>(ENDPOINT, config);
  return data;
}

export async function getAllHotelAgreement({
  params,
}: getHotelAgreementProps): Promise<HotelAgreementResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
      ...params,
    },
  };
  const { data } = await api.get<HotelAgreementResource[]>(ENDPOINT, config);
  return data;
}

export async function findHotelAgreementById(
  id: number
): Promise<HotelAgreementResource> {
  const response = await api.get<HotelAgreementResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeHotelAgreement(
  data: HotelAgreementSchema
): Promise<HotelAgreementResource> {
  const response = await api.post<HotelAgreementResource>(ENDPOINT, data);
  return response.data;
}

export async function updateHotelAgreement(
  id: number,
  data: HotelAgreementSchemaUpdate
): Promise<HotelAgreementResource> {
  const response = await api.put<HotelAgreementResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteHotelAgreement(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}

export async function toggleActiveHotelAgreement(
  id: number
): Promise<HotelAgreementResource> {
  const response = await api.patch<HotelAgreementResource>(
    `${ENDPOINT}/${id}/toggle-active`
  );
  return response.data;
}
