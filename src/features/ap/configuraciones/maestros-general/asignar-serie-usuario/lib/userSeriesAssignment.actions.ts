import { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { USER_SERIES_ASSIGNMENT } from "./userSeriesAssignment.constants";
import {
  getUserSeriesAssignmentProps,
  UserSeriesAssignmentResource,
  UserSeriesAssignmentResponse,
} from "./userSeriesAssignment.interface";
import { AssignSalesSeriesResource } from "../../asignar-serie-venta/lib/assignSalesSeries.interface";

const { ENDPOINT } = USER_SERIES_ASSIGNMENT;

export async function getUserSeriesAssignment({
  params,
}: getUserSeriesAssignmentProps): Promise<UserSeriesAssignmentResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<UserSeriesAssignmentResponse>(
    ENDPOINT,
    config
  );
  return data;
}

export async function getAllUserSeriesAssignment({
  params,
}: getUserSeriesAssignmentProps): Promise<UserSeriesAssignmentResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
      ...params,
    },
  };
  const { data } = await api.get<UserSeriesAssignmentResource[]>(
    ENDPOINT,
    config
  );
  return data;
}

export async function findUserSeriesAssignmentById(
  id: number
): Promise<UserSeriesAssignmentResource> {
  const response = await api.get<UserSeriesAssignmentResource>(
    `${ENDPOINT}/${id}`
  );
  return response.data;
}

export async function storeUserSeriesAssignment(
  data: any
): Promise<UserSeriesAssignmentResource> {
  const response = await api.post<UserSeriesAssignmentResource>(ENDPOINT, data);
  return response.data;
}

export async function updateUserSeriesAssignment(
  id: number,
  data: any
): Promise<UserSeriesAssignmentResource> {
  const response = await api.put<UserSeriesAssignmentResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function getAuthorizedSeries({
  params,
}: getUserSeriesAssignmentProps): Promise<AssignSalesSeriesResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<AssignSalesSeriesResource[]>(
    `${ENDPOINT}/authorized-series`,
    config
  );
  return data;
}
