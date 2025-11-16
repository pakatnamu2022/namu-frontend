import { useQuery } from "@tanstack/react-query";
import {
  findCurrencyTypesById,
  getAllCurrencyTypes,
  getCurrencyTypes,
} from "./CurrencyTypes.actions";
import {
  CurrencyTypesResource,
  CurrencyTypesResponse,
} from "./CurrencyTypes.interface";
import { CURRENCY_TYPES } from "./CurrencyTypes.constants";

const { QUERY_KEY } = CURRENCY_TYPES;

export const useCurrencyTypes = (params?: Record<string, any>) => {
  return useQuery<CurrencyTypesResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getCurrencyTypes({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllCurrencyTypes = (params?: Record<string, any>) => {
  return useQuery<CurrencyTypesResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllCurrencyTypes({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useCurrencyTypesById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findCurrencyTypesById(id),
    refetchOnWindowFocus: false,
  });
};
