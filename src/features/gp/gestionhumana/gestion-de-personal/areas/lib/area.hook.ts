import { useQuery } from "@tanstack/react-query";
import { AreaResource, AreaResponse } from "./area.interface.ts";
import { getAreas, getAllAreas } from "./area.actions.ts";
import { AREA } from "./area.constant.ts";

const { QUERY_KEY } = AREA;

export const useAreas = (params?: Record<string, any>) => {
  return useQuery<AreaResponse>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAreas({ params }),
  });
};

export const useAllAreas = () => {
  return useQuery<AreaResource[]>({
    queryKey: [QUERY_KEY, "all"],
    queryFn: () => getAllAreas(),
  });
};
