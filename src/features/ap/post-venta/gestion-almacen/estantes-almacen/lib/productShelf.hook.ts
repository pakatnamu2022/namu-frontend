import { useQuery } from "@tanstack/react-query";
import {
  ProductShelfResource,
  ProductShelfResponse,
  ShelfProductItem,
} from "./productShelf.interface.ts";
import {
  findProductShelfById,
  getAllProductShelves,
  getProductShelves,
  getShelfProducts,
} from "./productShelf.actions.ts";
import { PRODUCT_SHELF } from "./productShelf.constants.ts";

const { QUERY_KEY } = PRODUCT_SHELF;

export const useProductShelves = (
  params?: Record<string, any>,
  options?: { enabled?: boolean },
) => {
  return useQuery<ProductShelfResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getProductShelves({ params }),
    refetchOnWindowFocus: false,
    enabled: options?.enabled ?? true,
  });
};

export const useAllProductShelves = (
  params?: Record<string, any>,
  options?: { enabled?: boolean },
) => {
  return useQuery<ProductShelfResource[]>({
    queryKey: [QUERY_KEY, "all", params],
    queryFn: () => getAllProductShelves({ params }),
    refetchOnWindowFocus: false,
    enabled: options?.enabled ?? true,
  });
};

export const useProductShelfById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findProductShelfById(id),
    refetchOnWindowFocus: false,
    enabled: !!id,
  });
};

export const useShelfProducts = (
  shelfId: number,
  options?: { enabled?: boolean },
) => {
  return useQuery<ShelfProductItem[]>({
    queryKey: [QUERY_KEY, shelfId, "products"],
    queryFn: () => getShelfProducts(shelfId),
    refetchOnWindowFocus: false,
    enabled: options?.enabled ?? !!shelfId,
  });
};
