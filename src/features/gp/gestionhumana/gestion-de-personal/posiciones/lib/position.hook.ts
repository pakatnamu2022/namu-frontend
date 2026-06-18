import { useQuery } from "@tanstack/react-query";
import { PositionResource, PositionResponse } from "./position.interface.ts";
import { getAllPositions, getPosition } from "./position.actions.ts";
import { POSITION } from "./position.constant.ts";

const { QUERY_KEY } = POSITION;

export const usePositions = (params?: Record<string, any>) => {
  return useQuery<PositionResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getPosition({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllPositions = (params?: Record<string, any>) => {
  return useQuery<PositionResource[]>({
    queryKey: [QUERY_KEY + "All", params],
    queryFn: () => getAllPositions({ params }),
    refetchOnWindowFocus: false,
  });
};
