import { useQuery } from "@tanstack/react-query";
import { ManualResource, ManualResponse } from "./manual.interface";
import { findManualById, getManualsAdmin } from "./manual.actions";
import { MANUAL } from "./manual.constants";

const { QUERY_KEY } = MANUAL;

export const useManualList = (params?: Record<string, any>) => {
  return useQuery<ManualResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getManualsAdmin({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useManualById = (id: number) => {
  return useQuery<ManualResource>({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findManualById(id),
    refetchOnWindowFocus: false,
    enabled: !!id,
  });
};
