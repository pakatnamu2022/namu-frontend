import { useQuery } from "@tanstack/react-query";
import {
  ProductCategoryResource,
  ProductCategoryResponse,
} from "./productCategory.interface";
import {
  findProductCategoryById,
  getAllProductCategory,
  getProductCategory,
} from "./productCategory.actions";
import { PRODUCT_CATEGORY } from "./productCategory.constants";

const { QUERY_KEY } = PRODUCT_CATEGORY;

export const useProductCategory = (params?: Record<string, any>) => {
  return useQuery<ProductCategoryResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getProductCategory({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllProductCategory = (params?: Record<string, any>) => {
  return useQuery<ProductCategoryResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllProductCategory({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useProductCategoryById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findProductCategoryById(id),
    refetchOnWindowFocus: false,
  });
};
