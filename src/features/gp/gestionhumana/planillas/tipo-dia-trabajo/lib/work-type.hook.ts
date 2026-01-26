import { useQuery } from "@tanstack/react-query";
import { WorkTypeResource, WorkTypeResponse } from "./work-type.interface";
import { findWorkTypeById, getAllWorkTypes, getWorkTypes } from "./work-type.actions";
import { WORK_TYPE } from "./work-type.constant";

const { QUERY_KEY } = WORK_TYPE;

export const useWorkTypes = (params?: Record<string, any>) => {
  return useQuery<WorkTypeResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getWorkTypes({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllWorkTypes = () => {
  return useQuery<WorkTypeResource[]>({
    queryKey: [`${QUERY_KEY}-all`],
    queryFn: () => getAllWorkTypes(),
    refetchOnWindowFocus: false,
  });
};

export const useWorkTypeById = (id: number) => {
  return useQuery<WorkTypeResource>({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findWorkTypeById(id),
    refetchOnWindowFocus: false,
    enabled: !!id,
  });
};
