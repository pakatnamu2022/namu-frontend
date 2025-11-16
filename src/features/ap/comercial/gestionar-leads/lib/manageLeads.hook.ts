import { useQuery } from "@tanstack/react-query";
import { MANAGE_LEADS } from "./manageLeads.constants";
import {
  ManageLeadsResource,
  ManageLeadsResponse,
} from "./manageLeads.interface";
import {
  getAllManageLeads,
  getManageLeads,
  getMyLeads,
  getManageLead,
} from "./manageLeads.actions";

const { QUERY_KEY } = MANAGE_LEADS;

export const useManageLeads = (params?: Record<string, any>) => {
  return useQuery<ManageLeadsResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getManageLeads({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useMyLeads = (params?: Record<string, any>) => {
  return useQuery<ManageLeadsResource[]>({
    queryKey: [QUERY_KEY, "my", params],
    queryFn: () => getMyLeads({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllManageLeads = (params?: Record<string, any>) => {
  return useQuery<ManageLeadsResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllManageLeads({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useManageLead = (id: number) => {
  return useQuery<ManageLeadsResource>({
    queryKey: [QUERY_KEY, id],
    queryFn: () => getManageLead(id),
    refetchOnWindowFocus: false,
    enabled: !!id && id > 0,
  });
};
