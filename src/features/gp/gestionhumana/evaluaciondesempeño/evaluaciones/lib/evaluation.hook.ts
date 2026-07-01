import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  EvaluationResource,
  EvaluationResponse,
  EvaluationEligibleWorkerResource,
} from "./evaluation.interface";
import {
  addWorkersToEvaluation,
  findEvaluationById,
  getAllEvaluations,
  getBossesInEvaluation,
  getCategoriesInEvaluation,
  getEligibleWorkersInEvaluation,
  getEvaluation,
  getPersonsInEvaluation,
  getPositionsInEvaluation,
} from "./evaluation.actions";
import { EVALUATION } from "./evaluation.constans";
import { EVALUATION_PERSON } from "../../evaluation-person/lib/evaluationPerson.constans";

const { QUERY_KEY } = EVALUATION;

export const useEvaluations = (params?: Record<string, any>) => {
  return useQuery<EvaluationResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getEvaluation({ params }),
  });
};

export const useAllEvaluations = () => {
  return useQuery<EvaluationResource[]>({
    queryKey: [QUERY_KEY + "All"],
    queryFn: () => getAllEvaluations(),
  });
};

export const useEvaluation = (id?: number, params?: Record<string, any>) => {
  return useQuery<EvaluationResource>({
    queryKey: ["evaluationById", id, params],
    queryFn: () => findEvaluationById(id?.toString() || "", params),
    enabled: !!id && id > 0,
  });
};

export const usePersonsInEvaluation = (idEvaluation: number) => {
  return useQuery({
    queryKey: ["evaluation", idEvaluation, "persons"],
    queryFn: () => getPersonsInEvaluation(idEvaluation.toString()),
  });
};

export const usePositionsInEvaluation = (idEvaluation: number) => {
  return useQuery({
    queryKey: ["evaluation", idEvaluation, "positions"],
    queryFn: () => getPositionsInEvaluation(idEvaluation.toString()),
  });
};

export const useBossesInEvaluation = (idEvaluation: number) => {
  return useQuery({
    queryKey: ["evaluation", idEvaluation, "bosses"],
    queryFn: () => getBossesInEvaluation(idEvaluation.toString()),
  });
};

export const useCategoriesInEvaluation = (idEvaluation: number) => {
  return useQuery({
    queryKey: ["evaluation", idEvaluation, "categories"],
    queryFn: () => getCategoriesInEvaluation(idEvaluation.toString()),
  });
};

export const useEligibleWorkersInEvaluation = (
  idEvaluation: number,
  enabled = false
) => {
  return useQuery<EvaluationEligibleWorkerResource[]>({
    queryKey: ["evaluation", idEvaluation, "eligible-workers"],
    queryFn: () => getEligibleWorkersInEvaluation(idEvaluation),
    refetchOnWindowFocus: false,
    enabled,
  });
};

export const useAddWorkersToEvaluation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      evaluationId,
      workerIds,
    }: {
      evaluationId: number;
      workerIds: number[];
    }) => addWorkersToEvaluation(evaluationId, workerIds),
    onSuccess: (_, { evaluationId }) => {
      queryClient.invalidateQueries({
        queryKey: ["evaluation", evaluationId, "eligible-workers"],
      });
      queryClient.invalidateQueries({
        queryKey: ["evaluation", evaluationId, "persons"],
      });
      queryClient.invalidateQueries({
        queryKey: [EVALUATION_PERSON.QUERY_KEY],
      });
    },
  });
};
