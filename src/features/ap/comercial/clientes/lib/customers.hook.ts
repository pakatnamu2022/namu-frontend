import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { CUSTOMERS } from "./customers.constants";
import { CustomersResource, CustomersResponse } from "./customers.interface";
import {
  findCustomersById,
  findCustomerValidated,
  getAllCustomers,
  getCustomers,
} from "./customers.actions";
import { MessageResponse } from "@/core/core.interface";
import { AxiosError } from "axios";

const { QUERY_KEY } = CUSTOMERS;

export const useCustomers = (params?: Record<string, any>) => {
  return useQuery<CustomersResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getCustomers({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllCustomers = (params?: Record<string, any>) => {
  return useQuery<CustomersResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllCustomers({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useCustomersById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findCustomersById(id),
    refetchOnWindowFocus: false,
    enabled: id > 0,
  });
};

export const useCustomerValidated = (
  id: number,
  lead_id: number
): UseQueryResult<CustomersResource, AxiosError<MessageResponse>> => {
  return useQuery({
    queryKey: [QUERY_KEY, id, lead_id],
    queryFn: () => findCustomerValidated(id, lead_id),
    refetchOnWindowFocus: false,
    enabled: id > 0,
    retry: (failureCount, error) => {
      if (error?.response?.status === 422) {
        return false;
      }
      return failureCount < 3;
    },
  });
};
