import { useQuery } from "@tanstack/react-query";
import {
  PositionResource,
  PositionResponse,
  AreaResource,
} from "./position.interface.ts";
import {
  getAllPositions,
  getPosition,
  getAreas,
  getAllAreas,
} from "./position.actions.ts";
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

export const useAreas = () => {
  return useQuery<AreaResource[]>({
    queryKey: ["areas"],
    queryFn: getAreas,
    refetchOnWindowFocus: false,
  });
};

export const useAllAreas = () => {
  return useQuery<AreaResource[]>({
    queryKey: ["areas", "all"],
    queryFn: () => getAllAreas(),
    refetchOnWindowFocus: false,
  });
};
