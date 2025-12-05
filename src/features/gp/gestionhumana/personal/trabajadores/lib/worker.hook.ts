import { useQuery } from "@tanstack/react-query";
import { WorkerResource, WorkerResponse } from "./worker.interface";
import {
  getAllWorkers,
  getWorker,
  getWorkersWithoutObjectives,
  getWorkersWithoutCategories,
  getWorkersWithoutCompetences,
  getMyConsultants,
} from "./worker.actions";
import { WORKER } from "./worker.constant";

const { QUERY_KEY } = WORKER;

export const useWorkers = (params?: Record<string, any>) => {
  return useQuery<WorkerResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getWorker({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllWorkers = (params?: Record<string, any>) => {
  return useQuery<WorkerResource[]>({
    queryKey: [QUERY_KEY + "All", params],
    queryFn: () => getAllWorkers({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useMyConsultants = (params?: Record<string, any>) => {
  return useQuery<WorkerResource[]>({
    queryKey: [QUERY_KEY, "my-consultants", params],
    queryFn: () => getMyConsultants({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useWorkersWithoutObjectives = () => {
  return useQuery<WorkerResource[]>({
    queryKey: [QUERY_KEY + "WithoutObjectives"],
    queryFn: () => getWorkersWithoutObjectives(),
    refetchOnWindowFocus: false,
  });
};

export const useWorkersWithoutCategories = () => {
  return useQuery<WorkerResource[]>({
    queryKey: [QUERY_KEY + "WithoutCategories"],
    queryFn: () => getWorkersWithoutCategories(),
    refetchOnWindowFocus: false,
  });
};

export const useWorkersWithoutCompetences = () => {
  return useQuery<WorkerResource[]>({
    queryKey: [QUERY_KEY + "WithoutCompetences"],
    queryFn: () => getWorkersWithoutCompetences(),
    refetchOnWindowFocus: false,
  });
};
