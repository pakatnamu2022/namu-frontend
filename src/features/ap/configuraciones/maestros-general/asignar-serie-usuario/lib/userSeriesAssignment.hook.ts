import { useQuery } from "@tanstack/react-query";
import { USER_SERIES_ASSIGNMENT } from "./userSeriesAssignment.constants";
import {
  UserSeriesAssignmentResource,
  UserSeriesAssignmentResponse,
} from "./userSeriesAssignment.interface";
import {
  findUserSeriesAssignmentById,
  getAllUserSeriesAssignment,
  getAuthorizedSeries,
  getUserSeriesAssignment,
} from "./userSeriesAssignment.actions";
import { AssignSalesSeriesResource } from "../../asignar-serie-venta/lib/assignSalesSeries.interface";

const { QUERY_KEY } = USER_SERIES_ASSIGNMENT;

export const useUserSeriesAssignment = (params?: Record<string, any>) => {
  return useQuery<UserSeriesAssignmentResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getUserSeriesAssignment({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllUserSeriesAssignment = (params?: Record<string, any>) => {
  return useQuery<UserSeriesAssignmentResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllUserSeriesAssignment({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useUserSeriesAssignmentById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findUserSeriesAssignmentById(id),
    refetchOnWindowFocus: false,
  });
};

export const useAuthorizedSeries = (params?: Record<string, any>) => {
  return useQuery<AssignSalesSeriesResource[]>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getAuthorizedSeries({ params }),
    refetchOnWindowFocus: false,
  });
};
