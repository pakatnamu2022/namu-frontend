import { useQuery } from "@tanstack/react-query";
import {
  findAssignmentLeadershipById,
  getAssignmentLeadership,
} from "./assignmentLeadership.actions";
import { ASSIGNMENT_LEADERSHIP } from "./assignmentLeadership.constants";
import { AssignmentLeadershipResponse } from "./assignmentLeadership.interface";

const { QUERY_KEY } = ASSIGNMENT_LEADERSHIP;

export const useAssignmentLeadership = (params?: Record<string, any>) => {
  return useQuery<AssignmentLeadershipResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getAssignmentLeadership({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAssignmentLeadershipById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findAssignmentLeadershipById(id),
    refetchOnWindowFocus: false,
  });
};
