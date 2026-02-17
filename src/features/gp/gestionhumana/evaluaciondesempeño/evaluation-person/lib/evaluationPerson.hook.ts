import { useQuery } from "@tanstack/react-query";
import { EVALUATION_PERSON } from "./evaluationPerson.constans";
import {
  getEvaluationPersonResult,
  getEvaluationPersonResultByPersonAndEvaluation,
  getEvaluationsByPersonToEvaluate,
  getLeadersStatus,
  getTeamMembersByLeader,
} from "./evaluationPerson.actions";
import type {
  EvaluationPersonResultResource,
  LeaderStatusEvaluationResponse,
  TeamMembersResponse,
} from "./evaluationPerson.interface";

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

export const useLeadersStatus = (
  evaluationId: number,
  enabled: boolean = true,
  params?: Record<string, any>
) => {
  return useQuery<LeaderStatusEvaluationResponse>({
    queryKey: [QUERY_KEY, "leaders-status", evaluationId, params],
    queryFn: () => getLeadersStatus(evaluationId, params),
    refetchOnWindowFocus: false,
    enabled: !!evaluationId && enabled,
  });
};

export const useTeamMembersByLeader = (
  evaluationId: number,
  leaderId: number,
  enabled: boolean = true,
  params?: Record<string, any>
) => {
  return useQuery<TeamMembersResponse>({
    queryKey: [QUERY_KEY, "team-members", evaluationId, leaderId, params],
    queryFn: () => getTeamMembersByLeader(evaluationId, leaderId, params),
    refetchOnWindowFocus: false,
    enabled: !!evaluationId && !!leaderId && enabled,
  });
};
