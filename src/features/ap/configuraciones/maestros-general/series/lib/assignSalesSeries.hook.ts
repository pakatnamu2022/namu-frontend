import { useQuery } from "@tanstack/react-query";
import { ASSIGN_SALES_SERIES } from "./assignSalesSeries.constants";
import {
  AssignSalesSeriesResource,
  AssignSalesSeriesResponse,
} from "./assignSalesSeries.interface";
import {
  findAssignSalesSeriesById,
  getAllAssignSalesSeries,
  getAssignSalesSeries,
} from "./assignSalesSeries.actions";

const { QUERY_KEY } = ASSIGN_SALES_SERIES;

export const useAssignSalesSeries = (params?: Record<string, any>) => {
  return useQuery<AssignSalesSeriesResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getAssignSalesSeries({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllAssignSalesSeries = (params?: Record<string, any>) => {
  return useQuery<AssignSalesSeriesResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllAssignSalesSeries({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAssignSalesSeriesById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findAssignSalesSeriesById(id),
    refetchOnWindowFocus: false,
  });
};
