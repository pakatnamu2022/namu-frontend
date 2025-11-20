import { useQuery } from "@tanstack/react-query";
import {
  ParEvaluatorResource,
  ParEvaluatorResponse,
} from "./par-evaluator.interface";
import {
  getAllParEvaluators,
  getParEvaluator,
  getParEvaluatorsWithoutObjectives,
  getParEvaluatorsWithoutCategories,
  getParEvaluatorsWithoutCompetences,
} from "./par-evaluator.actions";
import { PAR_EVALUATOR } from "./par-evaluator.constant";

const { QUERY_KEY } = PAR_EVALUATOR;

export const useParEvaluators = (params?: Record<string, any>) => {
  return useQuery<ParEvaluatorResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getParEvaluator({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllParEvaluators = (params?: Record<string, any>) => {
  return useQuery<ParEvaluatorResource[]>({
    queryKey: [QUERY_KEY + "All", params],
    queryFn: () => getAllParEvaluators({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useParEvaluatorsWithoutObjectives = () => {
  return useQuery<ParEvaluatorResource[]>({
    queryKey: [QUERY_KEY + "WithoutObjectives"],
    queryFn: () => getParEvaluatorsWithoutObjectives(),
    refetchOnWindowFocus: false,
  });
};

export const useParEvaluatorsWithoutCategories = () => {
  return useQuery<ParEvaluatorResource[]>({
    queryKey: [QUERY_KEY + "WithoutCategories"],
    queryFn: () => getParEvaluatorsWithoutCategories(),
    refetchOnWindowFocus: false,
  });
};

export const useParEvaluatorsWithoutCompetences = () => {
  return useQuery<ParEvaluatorResource[]>({
    queryKey: [QUERY_KEY + "WithoutCompetences"],
    queryFn: () => getParEvaluatorsWithoutCompetences(),
    refetchOnWindowFocus: false,
  });
};
