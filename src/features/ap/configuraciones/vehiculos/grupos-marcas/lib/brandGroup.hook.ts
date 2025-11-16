import { useQuery } from "@tanstack/react-query";
import { BrandGroupResource, BrandGroupResponse } from "./brandGroup.interface";
import {
  findBrandGroupById,
  getAllBrandGroup,
  getBrandGroup,
} from "./brandGroup.actions";
import { BRAND_GROUP } from "./brandGroup.constants";

const { QUERY_KEY } = BRAND_GROUP;

export const useBrandGroup = (params?: Record<string, any>) => {
  return useQuery<BrandGroupResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getBrandGroup({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllBrandGroup = (params?: Record<string, any>) => {
  return useQuery<BrandGroupResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllBrandGroup({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useBrandGroupById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findBrandGroupById(id),
    refetchOnWindowFocus: false,
  });
};
