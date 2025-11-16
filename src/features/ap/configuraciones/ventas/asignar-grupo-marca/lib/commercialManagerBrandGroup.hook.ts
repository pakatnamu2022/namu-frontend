import { useQuery } from "@tanstack/react-query";
import {
  findCommercialManagerBrandGroupById,
  getCommercialManagerBrandGroup,
} from "./commercialManagerBrandGroup.actions";
import { COMMERCIAL_MANAGER_BRAND_GROUP } from "./commercialManagerBrandGroup.constants";
import { CommercialManagerBrandGroupResponse } from "./commercialManagerBrandGroup.interface";

const { QUERY_KEY } = COMMERCIAL_MANAGER_BRAND_GROUP;

export const useCommercialManagerBrandGroup = (
  params?: Record<string, any>
) => {
  return useQuery<CommercialManagerBrandGroupResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getCommercialManagerBrandGroup({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useCommercialManagerBrandGroupById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findCommercialManagerBrandGroupById(id),
    refetchOnWindowFocus: false,
  });
};
