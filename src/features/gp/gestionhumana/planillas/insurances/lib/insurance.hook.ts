import { useQuery } from "@tanstack/react-query";
import { InsuranceResource, InsuranceResponse } from "./insurance.interface";
import {
  findInsuranceById,
  getInsurances,
} from "./insurance.actions";
import { INSURANCE } from "./insurance.constant";

const { QUERY_KEY } = INSURANCE;

export const useInsurances = (params?: Record<string, any>) => {
  return useQuery<InsuranceResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getInsurances(params),
    refetchOnWindowFocus: false,
  });
};

export const useInsuranceById = (id: number) => {
  return useQuery<InsuranceResource>({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findInsuranceById(id),
    refetchOnWindowFocus: false,
    enabled: !!id,
  });
};
