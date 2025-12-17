import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  UserCompleteResource,
  UserResource,
  UserResponse,
  UserSedeResource,
  StoreUserSedesRequest,
} from "./user.interface";
import {
  getAllUser,
  getUser,
  getUserCompanies,
  getUserSedes,
  showUser,
  storeUserSedes,
} from "./user.actions";
import { CompanyResource } from "../../empresa/lib/company.interface";

export const useUsers = (params?: Record<string, any>) => {
  return useQuery<UserResponse>({
    queryKey: ["user", params],
    queryFn: () => getUser({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useUserComplete = (id: number) => {
  return useQuery<UserCompleteResource>({
    queryKey: ["user", id],
    queryFn: () => showUser(id),
    refetchOnWindowFocus: false,
  });
};

export const useAllUsers = (params?: Record<string, any>) => {
  return useQuery<UserResource[]>({
    queryKey: ["userAll", params],
    queryFn: () => getAllUser({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useUserSedes = (userId: number) => {
  return useQuery<UserSedeResource[]>({
    queryKey: ["userSedes", userId],
    queryFn: () => getUserSedes(userId),
    refetchOnWindowFocus: false,
    enabled: !!userId,
  });
};

export const useUserCompanies = () => {
  return useQuery<CompanyResource[]>({
    queryKey: ["userSedes"],
    queryFn: () => getUserCompanies(),
    refetchOnWindowFocus: false,
  });
};

export const useStoreUserSedes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: StoreUserSedesRequest) => storeUserSedes(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSedes"] });
    },
  });
};
