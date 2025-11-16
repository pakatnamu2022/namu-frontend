import { api } from "@/core/api";
import type { AxiosRequestConfig } from "axios";
import {
  ModuleResponse,
  GroupedSpecialPermissions,
  SyncPermissionsRequest,
  SpecialPermission,
  Permission,
  BulkCreatePermissionRequest,
} from "./permissions.interface";
import { ENDPOINT_PERMISSION } from "./permissions.constants";

export async function getModules(roleId: number): Promise<ModuleResponse> {
  const config: AxiosRequestConfig = {
    params: {
      roleId,
    },
  };
  const { data } = await api.get<ModuleResponse>(
    "/configuration/modules",
    config
  );
  return data;
}

export async function updateModulePermissions(
  roleId: number,
  accesses: any[]
): Promise<void> {
  return await api.post(`/configuration/roles/${roleId}/access`, accesses);
}

// Special Permissions Actions
export async function getGroupedSpecialPermissions(): Promise<GroupedSpecialPermissions> {
  const { data } = await api.get<GroupedSpecialPermissions>(
    "/configuration/permission/grouped-by-module"
  );
  return data;
}

export async function syncPermissionsToRole(
  request: SyncPermissionsRequest
): Promise<void> {
  return await api.post(
    "/configuration/permission/sync-permissions-to-role",
    request
  );
}

export async function getRoleSpecialPermissions(
  roleId: number
): Promise<SpecialPermission[]> {
  const { data } = await api.get<SpecialPermission[]>(
    `/configuration/permission/${roleId}/get-by-role`
  );
  return data;
}

/**
 * Get all permissions or filter by vista_id
 */
export async function getAllPermissions(params?: {
  vista_id?: number;
  all?: boolean;
}): Promise<Permission[]> {
  const config: AxiosRequestConfig = params ? { params } : {};
  const { data } = await api.get<Permission[]>(ENDPOINT_PERMISSION, config);
  return data;
}

/**
 * Bulk create permissions
 */
export async function bulkCreatePermissions(
  data: BulkCreatePermissionRequest
): Promise<void> {
  await api.post(`${ENDPOINT_PERMISSION}/bulk-sync`, data);
}
