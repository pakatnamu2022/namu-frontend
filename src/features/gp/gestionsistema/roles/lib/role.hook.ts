import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RoleResource, RoleResponse } from "./role.interface";
import {
  duplicateRole,
  findRoleById,
  getAllRole,
  getRole,
  getUsersByRole,
} from "./role.actions";
import { ROLE } from "./role.constants";
import { ERROR_MESSAGE, errorToast, SUCCESS_MESSAGE, successToast } from "@/core/core.function";
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

export const useUsersByRole = (roleId: number, enabled = true) => {
  return useQuery<UserResource[]>({
    queryKey: ["roleUsers", roleId],
    queryFn: () => getUsersByRole(roleId),
    refetchOnWindowFocus: false,
    enabled,
  });
};

export const useRoleById = (id: number) => {
  return useQuery({
    queryKey: ["role", id],
    queryFn: () => findRoleById(id),
    refetchOnWindowFocus: false,
  });
};

export const useDuplicateRole = () => {
  const queryClient = useQueryClient();
  const { MODEL, QUERY_KEY } = ROLE;

  return useMutation({
    mutationFn: (id: number) => duplicateRole(id),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      await queryClient.invalidateQueries({ queryKey: ["role"] });
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message ?? ERROR_MESSAGE(MODEL, "create"));
    },
  });
};
