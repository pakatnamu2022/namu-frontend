import { useQuery } from "@tanstack/react-query";
import { TYPE_PERSON } from "./typeClient.constants";
import { TypeClientResource, TypeClientResponse } from "./typeClient.interface";
import {
  findTypeClientById,
  getAllTypeClient,
  getTypeClient,
} from "./typeClient.actions";

const { QUERY_KEY } = TYPE_PERSON;

export const useTypeClient = (params?: Record<string, any>) => {
  return useQuery<TypeClientResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getTypeClient({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllTypeClient = (params?: Record<string, any>) => {
  return useQuery<TypeClientResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllTypeClient({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useTypeClientById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findTypeClientById(id),
    refetchOnWindowFocus: false,
  });
};
