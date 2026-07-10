import { useQuery } from "@tanstack/react-query";
import { CAMPAIGN } from "./campaign.constants";
import { CampaignResource, CampaignResponse } from "./campaign.interface";
import {
  findCampaignById,
  getActiveCampaign,
  getAllCampaign,
  getCampaign,
} from "./campaign.actions";

const { QUERY_KEY } = CAMPAIGN;

export const useCampaign = (params?: Record<string, any>) => {
  return useQuery<CampaignResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getCampaign({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllCampaign = (params?: Record<string, any>) => {
  return useQuery<CampaignResource[]>({
    queryKey: [QUERY_KEY, "all", params],
    queryFn: () => getAllCampaign({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useCampaignById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findCampaignById(id),
    refetchOnWindowFocus: false,
    enabled: !!id,
  });
};

export const useActiveCampaign = (params?: Record<string, any>) => {
  return useQuery<CampaignResource | null>({
    queryKey: [QUERY_KEY, "active", params],
    queryFn: () => getActiveCampaign({ params }),
    refetchOnWindowFocus: false,
    enabled: !!params?.area_id,
  });
};
