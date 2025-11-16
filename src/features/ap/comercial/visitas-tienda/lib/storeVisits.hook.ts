import { useQuery } from "@tanstack/react-query";
import { STORE_VISITS } from "./storeVisits.constants";
import {
  StoreVisitsResource,
  StoreVisitsResponse,
} from "./storeVisits.interface";
import {
  findStoreVisitsById,
  getAllStoreVisits,
  getStoreVisits,
} from "./storeVisits.actions";

const { QUERY_KEY } = STORE_VISITS;

export const useStoreVisits = (params?: Record<string, any>) => {
  return useQuery<StoreVisitsResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getStoreVisits({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllStoreVisits = (params?: Record<string, any>) => {
  return useQuery<StoreVisitsResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllStoreVisits({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useStoreVisitsById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findStoreVisitsById(id),
    refetchOnWindowFocus: false,
  });
};
