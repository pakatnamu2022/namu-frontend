import { useQuery } from "@tanstack/react-query";
import {
  findAssignBrandConsultantById,
  getAllBrandsBySede,
  getAllWorkersBySedeAndBrand,
  getAssignBrandConsultant,
} from "./assignBrandConsultant.actions";
import { ASSIGN_BRAND_CONSULTANT } from "./assignBrandConsultant.constants";
import {
  AssignBrandConsultantResponse,
  BrandResource,
} from "./assignBrandConsultant.interface";

const { QUERY_KEY } = ASSIGN_BRAND_CONSULTANT;

export const useAssignBrandConsultant = (params?: Record<string, any>) => {
  return useQuery<AssignBrandConsultantResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getAssignBrandConsultant({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllBrandsBySede = (idSede?: number) => {
  return useQuery<BrandResource[]>({
    queryKey: [QUERY_KEY, idSede],
    queryFn: () => getAllBrandsBySede(idSede!),
    refetchOnWindowFocus: false,
    enabled: !!idSede,
  });
};

export const useAllWorkersBySedeAndBrand = (
  idSede?: number,
  idBrand?: number
) => {
  return useQuery<BrandResource[]>({
    queryKey: [QUERY_KEY, idSede, idBrand],
    queryFn: () => getAllWorkersBySedeAndBrand(idSede!, idBrand!),
    refetchOnWindowFocus: false,
    enabled: !!idSede,
  });
};

export const useAssignBrandConsultantById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findAssignBrandConsultantById(id),
    refetchOnWindowFocus: false,
  });
};
