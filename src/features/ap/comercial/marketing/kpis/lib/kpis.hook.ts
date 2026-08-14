import { useQuery } from "@tanstack/react-query";
import { getAllKpis, getKpis, findKpisById } from "./kpis.actions";
import { KpisResource, KpisResponse } from "./kpis.interface";
import { KPIS } from "./kpis.constants";

const { QUERY_KEY } = KPIS;

export const useKpis = (params?: Record<string, any>) => {
  return useQuery<KpisResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getKpis({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllKpis = (params?: Record<string, any>) => {
  return useQuery<KpisResource[]>({
    queryKey: [QUERY_KEY, "all", params],
    queryFn: () => getAllKpis({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useKpisById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findKpisById(id),
    refetchOnWindowFocus: false,
    enabled: id > 0,
  });
};
