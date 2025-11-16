import { useQuery } from "@tanstack/react-query";
import { SHOP } from "./shop.constants";
import { ShopResource, ShopResponse } from "./shop.interface";
import { findShopById, getAllShop, getShop } from "./shop.actions";

const { QUERY_KEY } = SHOP;

export const useShop = (params?: Record<string, any>) => {
  return useQuery<ShopResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getShop({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllShop = (params?: Record<string, any>) => {
  return useQuery<ShopResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllShop({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useShopById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findShopById(id),
    refetchOnWindowFocus: false,
  });
};
