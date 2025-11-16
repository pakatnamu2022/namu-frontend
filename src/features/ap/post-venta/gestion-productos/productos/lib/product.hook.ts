import { useQuery } from "@tanstack/react-query";
import {
  ProductResource,
  ProductResponse,
} from "./product.interface";
import {
  findProductById,
  getAllProduct,
  getProduct,
} from "./product.actions";
import { PRODUCT } from "./product.constants";

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
    queryKey: [QUERY_KEY],
    queryFn: () => getAllProduct({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useProductById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findProductById(id),
    refetchOnWindowFocus: false,
  });
};
