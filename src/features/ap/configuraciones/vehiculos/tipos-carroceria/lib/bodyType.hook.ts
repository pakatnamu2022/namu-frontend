import { useQuery } from "@tanstack/react-query";
import { BodyTypeResource, BodyTypeResponse } from "./bodyType.interface";
import {
  findBodyTypeById,
  getAllBodyType,
  getBodyType,
} from "./bodyType.actions";
import { BODY_TYPE } from "./bodyType.constants";

const { QUERY_KEY } = BODY_TYPE;

export const useBodyType = (params?: Record<string, any>) => {
  return useQuery<BodyTypeResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getBodyType({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllBodyType = (params?: Record<string, any>) => {
  return useQuery<BodyTypeResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllBodyType({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useBodyTypeById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findBodyTypeById(id),
    refetchOnWindowFocus: false,
  });
};
