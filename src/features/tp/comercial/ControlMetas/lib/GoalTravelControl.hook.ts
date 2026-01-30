import { useQuery } from "@tanstack/react-query";
import {
  GoalTravelControlResponse,
  GoalTravelQueryParams,
} from "./GoalTravelControl.interface";
import { findGoalTravelById, getGoalTravel } from "./GoalTravelControl.actions";

export const useGoalTravelControl = (params?: GoalTravelQueryParams) => {
  return useQuery<GoalTravelControlResponse>({
    queryKey: ["goal", params],
    queryFn: () => getGoalTravel({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useGoalTravelById = (id: number) => {
  return useQuery({
    queryKey: ["goal", id],
    queryFn: () => findGoalTravelById(id),
    refetchOnWindowFocus: false,
  });
};
