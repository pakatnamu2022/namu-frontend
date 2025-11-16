import { useQuery } from "@tanstack/react-query";
import { TAX_CLASS_TYPES } from "./taxClassTypes.constants";
import {
  TaxClassTypesResource,
  TaxClassTypesResponse,
} from "./taxClassTypes.interface";
import {
  findTaxClassTypesById,
  getAllTaxClassTypes,
  getTaxClassTypes,
} from "./taxClassTypes.actions";

const { QUERY_KEY } = TAX_CLASS_TYPES;

export const useTaxClassTypes = (params?: Record<string, any>) => {
  return useQuery<TaxClassTypesResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getTaxClassTypes({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllTaxClassTypes = (params?: Record<string, any>) => {
  return useQuery<TaxClassTypesResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllTaxClassTypes({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useTaxClassTypesById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findTaxClassTypesById(id),
    refetchOnWindowFocus: false,
  });
};
