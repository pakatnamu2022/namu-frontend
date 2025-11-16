import { useQuery } from "@tanstack/react-query";
import {
  EvaluationPersonDetailResource,
  EvaluationPersonDetailResponse,
} from "./excluded.interface";
import {
  getAllEvaluationPersonDetails,
  getEvaluationPersonDetail,
} from "./excluded.actions";
import { EXCLUDED } from "./excluded.constants";

const { QUERY_KEY } = EXCLUDED;

export const useExcluded = (params?: Record<string, any>) => {
  return useQuery<EvaluationPersonDetailResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getEvaluationPersonDetail({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllExcluded = () => {
  return useQuery<EvaluationPersonDetailResource[]>({
    queryKey: [`${QUERY_KEY}All`],
    queryFn: () => getAllEvaluationPersonDetails(),
    refetchOnWindowFocus: false,
  });
};
