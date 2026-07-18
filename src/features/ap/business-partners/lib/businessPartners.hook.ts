import { useQuery } from "@tanstack/react-query";
import { BUSINESS_PARTNERS_MASTER } from "./businessPartners.constants.ts";
import { BusinessPartnersResponse } from "./businessPartners.interface.ts";
import {
  findBusinessPartnersById,
  getBusinessPartners,
} from "./businessPartners.actions.ts";

const { QUERY_KEY } = BUSINESS_PARTNERS_MASTER;

export const useBusinessPartners = (params?: Record<string, any>) => {
  return useQuery<BusinessPartnersResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getBusinessPartners({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useBusinessPartnersById = (
  id: number,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findBusinessPartnersById(id),
    refetchOnWindowFocus: false,
    enabled: id > 0 && enabled,
  });
};
