import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import type { AxiosRequestConfig } from "axios";
import {
  getUsersProps,
  UserCompleteResource,
  UserResource,
  UserResponse,
  UserSedeResource,
  StoreUserSedesRequest,
} from "./user.interface";
import { CompanyResource } from "../../empresa/lib/company.interface";

export async function getUser({
  params,
}: getUsersProps): Promise<UserResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<UserResponse>("/configuration/user", config);
  return data;
}

export async function getAllUser({
  params,
}: getUsersProps): Promise<UserResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      all: true,
    },
  };
  const { data } = await api.get<UserResource[]>("/configuration/user", config);
  return data;
}

export async function findUserById(id: number): Promise<UserResource> {
  const response = await api.get<UserResource>(`/configuration/user/${id}`);
  return response.data;
}

export async function showUser(id: number): Promise<UserCompleteResource> {
  const response = await api.get<UserCompleteResource>(
    `/configuration/user/${id}/complete`
  );
  return response.data;
}

export async function storeUser(data: any): Promise<UserResponse> {
  const response = await api.post<UserResponse>("/configuration/user", data);
  return response.data;
}

export async function updateUser(id: number, data: any): Promise<UserResponse> {
  const response = await api.put<UserResponse>(
    `/configuration/user/${id}`,
    data
  );
  return response.data;
}

export async function deleteUser(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(
    `/configuration/user/${id}`
  );
  return data;
}

export async function getUserSedes(
  userId: number
): Promise<UserSedeResource[]> {
  const { data } = await api.get<UserSedeResource[]>(
    `/configuration/user-sede/user/${userId}/sedes`
  );
  return data;
}

export async function getUserCompanies(): Promise<CompanyResource[]> {
  const { data } = await api.get<CompanyResource[]>(
    `/configuration/user/my-companies`
  );
  return data;
}

export async function storeUserSedes(
  request: StoreUserSedesRequest
): Promise<GeneralResponse> {
  const { data } = await api.post<GeneralResponse>(
    "/configuration/user-sede/store-many",
    request
  );
  return data;
}
