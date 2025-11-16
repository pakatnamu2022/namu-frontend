import { AxiosRequestConfig } from "axios";
import { api } from "@/src/core/api";
import { ESTABLISHMENTS } from "./establishments.constants";
import {
  EstablishmentsResource,
  EstablishmentsResponse,
  getEstablishmentsProps,
} from "./establishments.interface";
import { EstablishmentsSchema } from "./establishments.schema";

const { ENDPOINT } = ESTABLISHMENTS;

export async function getEstablishments({
  params,
}: getEstablishmentsProps): Promise<EstablishmentsResponse> {
  const config: AxiosRequestConfig = {
    params,
  };
  const { data } = await api.get<EstablishmentsResponse>(ENDPOINT, config);
  return data;
}

export async function getAllEstablishments({
  params,
}: getEstablishmentsProps): Promise<EstablishmentsResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      all: true,
    },
  };
  const { data } = await api.get<EstablishmentsResource[]>(ENDPOINT, config);
  return data;
}

export async function findEstablishmentsById(
  id: number
): Promise<EstablishmentsResource> {
  const { data } = await api.get<EstablishmentsResource>(`${ENDPOINT}/${id}`);
  return data;
}

export async function createEstablishments(
  payload: EstablishmentsSchema
): Promise<EstablishmentsResource> {
  const { data } = await api.post<EstablishmentsResource>(ENDPOINT, payload);
  return data;
}

export async function updateEstablishments(
  id: number,
  payload: any
): Promise<EstablishmentsResource> {
  const { data } = await api.put<EstablishmentsResource>(
    `${ENDPOINT}/${id}`,
    payload
  );
  return data;
}

export async function deleteEstablishments(id: number): Promise<void> {
  await api.delete(`${ENDPOINT}/${id}`);
}
