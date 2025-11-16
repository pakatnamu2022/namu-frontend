import { useQuery } from "@tanstack/react-query";
import { RoleResource, RoleResponse } from "./role.interface";
import {
  findRoleById,
  getAllRole,
  getRole,
  getUsersByRole,
} from "./role.actions";
import { UserResource } from "../../usuarios/lib/user.interface";

export const useRoles = (params?: Record<string, any>) => {
  return useQuery<RoleResponse>({
    queryKey: ["role", params],
    queryFn: () => getRole({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllRoles = () => {
  return useQuery<RoleResource[]>({
    queryKey: ["roleAll"],
    queryFn: () => getAllRole(),
    refetchOnWindowFocus: false,
  });
};

export const useUsersByRole = (roleId: number) => {
  return useQuery<UserResource[]>({
    queryKey: ["roleUsers", roleId],
    queryFn: () => getUsersByRole(roleId),
    refetchOnWindowFocus: false,
  });
};

export const useRoleById = (id: number) => {
  return useQuery({
    queryKey: ["role", id],
    queryFn: () => findRoleById(id),
    refetchOnWindowFocus: false,
  });
};
