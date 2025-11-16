import { useQuery } from "@tanstack/react-query";
import {
  ProductTypeResource,
  ProductTypeResponse,
} from "./productType.interface";
import {
  findProductTypeById,
  getAllProductType,
  getProductType,
} from "./productType.actions";
import { PRODUCT_TYPE } from "./productType.constants";

const { QUERY_KEY } = PRODUCT_TYPE;

export const useProductType = (params?: Record<string, any>) => {
  return useQuery<ProductTypeResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getProductType({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllProductType = (params?: Record<string, any>) => {
  return useQuery<ProductTypeResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllProductType({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useProductTypeById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findProductTypeById(id),
    refetchOnWindowFocus: false,
  });
};
