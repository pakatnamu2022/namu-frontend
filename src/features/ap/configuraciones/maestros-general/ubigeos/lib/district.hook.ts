import { useQuery } from "@tanstack/react-query";
import { DISTRICT } from "./district.constants";
import { DistrictResource, DistrictResponse } from "./district.interface";
import {
  findDistrictById,
  getAllDistrict,
  getDistrict,
} from "./district.actions";

const { QUERY_KEY } = DISTRICT;

export const useDistrict = (params?: Record<string, any>) => {
  return useQuery<DistrictResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getDistrict({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllDistrict = (params?: Record<string, any>) => {
  return useQuery<DistrictResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllDistrict({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useDistrictById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findDistrictById(id),
    refetchOnWindowFocus: false,
  });
};
