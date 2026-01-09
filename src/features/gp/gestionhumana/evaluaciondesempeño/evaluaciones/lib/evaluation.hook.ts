import { useQuery } from "@tanstack/react-query";
import { EvaluationResource, EvaluationResponse } from "./evaluation.interface";
import {
  findEvaluationById,
  getAllEvaluations,
  getBossesInEvaluation,
  getCategoriesInEvaluation,
  getEvaluation,
  getPersonsInEvaluation,
  getPositionsInEvaluation,
} from "./evaluation.actions";
import { EVALUATION } from "./evaluation.constans";

const { QUERY_KEY } = EVALUATION;

export const useEvaluations = (params?: Record<string, any>) => {
  return useQuery<EvaluationResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getEvaluation({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllEvaluations = () => {
  return useQuery<EvaluationResource[]>({
    queryKey: [QUERY_KEY + "All"],
    queryFn: () => getAllEvaluations(),
    refetchOnWindowFocus: false,
  });
};

export const useEvaluation = (id?: number) => {
  return useQuery<EvaluationResource>({
    queryKey: ["evaluationById", id],
    queryFn: () => findEvaluationById(id?.toString() || ""),
    enabled: !!id && id > 0,
    refetchOnWindowFocus: false,
  });
};

export const usePersonsInEvaluation = (idEvaluation: number) => {
  return useQuery({
    queryKey: ["evaluation", idEvaluation, "persons"],
    queryFn: () => getPersonsInEvaluation(idEvaluation.toString()),
    refetchOnWindowFocus: false,
  });
};

export const usePositionsInEvaluation = (idEvaluation: number) => {
  return useQuery({
    queryKey: ["evaluation", idEvaluation, "positions"],
    queryFn: () => getPositionsInEvaluation(idEvaluation.toString()),
    refetchOnWindowFocus: false,
  });
};

export const useBossesInEvaluation = (idEvaluation: number) => {
  return useQuery({
    queryKey: ["evaluation", idEvaluation, "bosses"],
    queryFn: () => getBossesInEvaluation(idEvaluation.toString()),
    refetchOnWindowFocus: false,
  });
};

export const useCategoriesInEvaluation = (idEvaluation: number) => {
  return useQuery({
    queryKey: ["evaluation", idEvaluation, "categories"],
    queryFn: () => getCategoriesInEvaluation(idEvaluation.toString()),
    refetchOnWindowFocus: false,
  });
};
