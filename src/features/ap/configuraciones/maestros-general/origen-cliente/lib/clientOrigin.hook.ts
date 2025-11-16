import { useQuery } from "@tanstack/react-query";
import {
  findClientOriginById,
  getAllClientOrigin,
  getClientOrigin,
} from "./clientOrigin.actions";
import { CLIENT_ORIGIN } from "./clientOrigin.constants";
import {
  ClientOriginResource,
  ClientOriginResponse,
} from "./clientOrigin.interface";

const { QUERY_KEY } = CLIENT_ORIGIN;

export const useClientOrigin = (params?: Record<string, any>) => {
  return useQuery<ClientOriginResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getClientOrigin({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllClientOrigin = (params?: Record<string, any>) => {
  return useQuery<ClientOriginResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllClientOrigin({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useClientOriginById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findClientOriginById(id),
    refetchOnWindowFocus: false,
  });
};
