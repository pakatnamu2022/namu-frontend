import { useQuery } from "@tanstack/react-query";
import { TYPE_GENDER } from "./typesGender.constants";
import {
  TypeGenderResource,
  TypeGenderResponse,
} from "./typesGender.interface";
import {
  findTypeGenderById,
  getAllTypeGender,
  getTypeGender,
} from "./typesGender.actions";

const { QUERY_KEY } = TYPE_GENDER;

export const useTypeGender = (params?: Record<string, any>) => {
  return useQuery<TypeGenderResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getTypeGender({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllTypeGender = (params?: Record<string, any>) => {
  return useQuery<TypeGenderResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllTypeGender({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useTypeGenderById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findTypeGenderById(id),
    refetchOnWindowFocus: false,
  });
};
