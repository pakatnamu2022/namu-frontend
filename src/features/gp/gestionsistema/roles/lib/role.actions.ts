import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { AxiosRequestConfig } from "axios";
import { getRolesProps, RoleResource, RoleResponse } from "./role.interface";
import { UserResource } from "../../usuarios/lib/user.interface";

export async function getRole({
  params,
}: getRolesProps): Promise<RoleResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<RoleResponse>("/configuration/role", config);
  return data;
}

export async function getAllRole(): Promise<RoleResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
    },
  };
  const { data } = await api.get<RoleResource[]>("/configuration/role", config);
  return data;
}

export async function findRoleById(id: number): Promise<RoleResource> {
  const response = await api.get<RoleResource>(`/configuration/role/${id}`);
  return response.data;
}

export async function storeRole(data: any): Promise<RoleResponse> {
  const response = await api.post<RoleResponse>("/configuration/role", data);
  return response.data;
}

export async function updateRole(id: number, data: any): Promise<RoleResponse> {
  const response = await api.put<RoleResponse>(
    `/configuration/role/${id}`,
    data
  );
  return response.data;
}

export async function deleteRole(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(
    `/configuration/role/${id}`
  );
  return data;
}

export async function getUsersByRole(roleId: number): Promise<UserResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      roleId,
    },
  };
  const { data } = await api.get<UserResource[]>(
    `/configuration/role/${roleId}/users`,
    config
  );
  return data;
}
