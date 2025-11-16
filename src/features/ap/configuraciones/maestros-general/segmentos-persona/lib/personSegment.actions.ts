import type { AxiosRequestConfig } from "axios";
import { STATUS_ACTIVE } from "@/core/core.constants";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { PERSON_SEGMENT } from "./personSegment.constants";
import {
  getPersonSegmentProps,
  PersonSegmentResource,
  PersonSegmentResponse,
} from "./personSegment.interface";
import { AP_MASTER_COMERCIAL } from "../../../../lib/ap.constants";

const { ENDPOINT } = PERSON_SEGMENT;

export async function getPersonSegment({
  params,
}: getPersonSegmentProps): Promise<PersonSegmentResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      type: AP_MASTER_COMERCIAL.PERSON_SEGMENT,
    },
  };
  const { data } = await api.get<PersonSegmentResponse>(ENDPOINT, config);
  return data;
}

export async function getAllPersonSegment({
  params,
}: getPersonSegmentProps): Promise<PersonSegmentResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
      ...params,
      type: AP_MASTER_COMERCIAL.PERSON_SEGMENT,
      status: STATUS_ACTIVE,
    },
  };
  const { data } = await api.get<PersonSegmentResource[]>(ENDPOINT, config);
  return data;
}

export async function findPersonSegmentById(
  id: number
): Promise<PersonSegmentResource> {
  const response = await api.get<PersonSegmentResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storePersonSegment(
  data: any
): Promise<PersonSegmentResource> {
  const response = await api.post<PersonSegmentResource>(ENDPOINT, data);
  return response.data;
}

export async function updatePersonSegment(
  id: number,
  data: any
): Promise<PersonSegmentResource> {
  const response = await api.put<PersonSegmentResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deletePersonSegment(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
