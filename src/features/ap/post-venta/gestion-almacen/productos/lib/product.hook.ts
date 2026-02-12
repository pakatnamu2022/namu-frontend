import { useQuery } from "@tanstack/react-query";
import { ProductResource, ProductResponse } from "./product.interface.ts";
import { findProductById, getAllProduct, getProduct } from "./product.actions.ts";
import { PRODUCT } from "./product.constants.ts";

const { QUERY_KEY } = PRODUCT;

export const useProduct = (params?: Record<string, any>) => {
  return useQuery<ProductResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getProduct({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllProduct = (params?: Record<string, any>) => {
  return useQuery<ProductResource[]>({
    queryKey: [QUERY_KEY, "all", params],
    queryFn: () => getAllProduct({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useProductById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findProductById(id),
    refetchOnWindowFocus: false,
    enabled: id > 0,
  });
};
