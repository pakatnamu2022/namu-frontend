import { useQuery } from "@tanstack/react-query";
import { getSupports, findSupportsById } from "./supports.actions";
import { SupportsResponse } from "./supports.interface";
import { SUPPORTS } from "./supports.constants";

const { QUERY_KEY } = SUPPORTS;

export const useSupports = (params?: Record<string, any>) => {
  return useQuery<SupportsResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getSupports({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useSupportsById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findSupportsById(id),
    refetchOnWindowFocus: false,
    enabled: id > 0,
  });
};
