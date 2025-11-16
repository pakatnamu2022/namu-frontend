import { useQuery } from "@tanstack/react-query";
import {
  ClassArticleResource,
  ClassArticleResponse,
} from "./classArticle.interface";
import { getAllClassArticle, getClassArticle } from "./classArticle.actions";
import { findBrandsById } from "@/features/ap/configuraciones/vehiculos/marcas/lib/brands.actions";
import { CLASS_ARTICLE } from "./classArticle.constants";

const { QUERY_KEY } = CLASS_ARTICLE;

export const useClassArticle = (params?: Record<string, any>) => {
  return useQuery<ClassArticleResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getClassArticle({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllClassArticle = (params?: Record<string, any>) => {
  return useQuery<ClassArticleResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllClassArticle({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useBrandById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findBrandsById(id),
    refetchOnWindowFocus: false,
  });
};
