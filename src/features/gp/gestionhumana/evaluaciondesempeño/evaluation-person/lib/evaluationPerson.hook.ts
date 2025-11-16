import { useQuery } from "@tanstack/react-query";
import { EVALUATION_PERSON } from "./evaluationPerson.constans";
import {
  getEvaluationPersonResult,
  getEvaluationPersonResultByPersonAndEvaluation,
  getTeamByChief,
} from "./evaluationPerson.actions";
import { EvaluationPersonResultResource } from "./evaluationPerson.interface";

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
  });
};

export const useEvaluationPersonResult = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getEvaluationPersonResult(params),
    refetchOnWindowFocus: false,
  });
};

export const useTeamByChief = (
  id: number,
  enabled: boolean,
  params?: Record<string, any>
) => {
  return useQuery({
    queryKey: [QUERY_KEY, id, params],
    queryFn: () => getTeamByChief(id, params),
    refetchOnWindowFocus: false,
    enabled: enabled,
  });
};
