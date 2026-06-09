import { useQuery } from "@tanstack/react-query";
import { FamilyAllowanceResponse } from "./family-allowance.interface";
import { getFamilyAllowances } from "./family-allowance.actions";
import { FAMILY_ALLOWANCE } from "./family-allowance.constant";

const { QUERY_KEY } = FAMILY_ALLOWANCE;

export const useFamilyAllowances = (params?: Record<string, any>) => {
  return useQuery<FamilyAllowanceResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getFamilyAllowances(params),
    refetchOnWindowFocus: false,
  });
};
