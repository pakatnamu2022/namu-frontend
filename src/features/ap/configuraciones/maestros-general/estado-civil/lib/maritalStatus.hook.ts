import { useQuery } from "@tanstack/react-query";

import { MARITAL_STATUS } from "./maritalStatus.constants";
import {
  MaritalStatusResource,
  MaritalStatusResponse,
} from "./maritalStatus.interface";
import {
  findMaritalStatusById,
  getAllMaritalStatus,
  getMaritalStatus,
} from "./maritalStatus.actions";

const { QUERY_KEY } = MARITAL_STATUS;

export const useMaritalStatus = (params?: Record<string, any>) => {
  return useQuery<MaritalStatusResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getMaritalStatus({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllMaritalStatus = (params?: Record<string, any>) => {
  return useQuery<MaritalStatusResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllMaritalStatus({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useMaritalStatusById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findMaritalStatusById(id),
    refetchOnWindowFocus: false,
  });
};
