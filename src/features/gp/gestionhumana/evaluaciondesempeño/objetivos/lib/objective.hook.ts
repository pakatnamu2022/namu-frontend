import { useQuery } from "@tanstack/react-query";
import { ObjectiveResource, ObjectiveResponse } from "./objective.interface";
import { getAllObjective, getObjective } from "./objective.actions";

export const useObjectives = (params?: Record<string, any>) => {
  return useQuery<ObjectiveResponse>({
    queryKey: ["objective", params],
    queryFn: () => getObjective({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllObjectives = (params?: Record<string, any>) => {
  return useQuery<ObjectiveResource[]>({
    queryKey: ["objectiveAll", params],
    queryFn: () => getAllObjective({ params }),
    refetchOnWindowFocus: false,
  });
};
