import { useQuery } from "@tanstack/react-query";
import { EVALUATION_PERSON } from "./evaluationPerson.constans";
import {
  getEvaluationPersonResult,
  getEvaluationPersonResultByPersonAndEvaluation,
  getEvaluationsByPersonToEvaluate,
} from "./evaluationPerson.actions";
import type { EvaluationPersonResultResource } from "./evaluationPerson.interface";

const { QUERY_KEY } = EVALUATION_PERSON;

export const useEvaluationPersonByPersonAndEvaluation = (
  person_id: number,
  evaluation_id?: number
) => {
  return useQuery<EvaluationPersonResultResource>({
    queryKey: [QUERY_KEY, person_id, evaluation_id],
    queryFn: () =>
      getEvaluationPersonResultByPersonAndEvaluation(person_id, evaluation_id),
    refetchOnWindowFocus: false,
    enabled: !!person_id && !!evaluation_id,
  });
};

export const useEvaluationPersonResult = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getEvaluationPersonResult(params),
    refetchOnWindowFocus: false,
  });
};

export const useEvaluationsByPersonToEvaluate = (
  id: number,
  enabled: boolean,
  params?: Record<string, any>
) => {
  return useQuery({
    queryKey: [QUERY_KEY, id, params],
    queryFn: () => getEvaluationsByPersonToEvaluate(id, params),
    refetchOnWindowFocus: false,
    enabled: enabled,
  });
};
