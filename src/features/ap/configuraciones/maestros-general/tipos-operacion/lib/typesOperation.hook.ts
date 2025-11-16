import { useQuery } from "@tanstack/react-query";
import { TYPES_OPERATION } from "./typesOperation.constants";
import {
  TypesOperationResource,
  TypesOperationResponse,
} from "./typesOperation.interface";
import {
  findTypesOperationById,
  getAllTypesOperation,
  getTypesOperation,
} from "./typesOperation.actions";

const { QUERY_KEY } = TYPES_OPERATION;

export const useTypesOperation = (params?: Record<string, any>) => {
  return useQuery<TypesOperationResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getTypesOperation({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllTypesOperation = (params?: Record<string, any>) => {
  return useQuery<TypesOperationResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllTypesOperation({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useTypesOperationById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findTypesOperationById(id),
    refetchOnWindowFocus: false,
  });
};
