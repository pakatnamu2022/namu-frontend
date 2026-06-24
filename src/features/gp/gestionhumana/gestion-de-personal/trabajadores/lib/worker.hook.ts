import { useQuery } from "@tanstack/react-query";
import {
  getWorkerProps,
  PersonBirthdayResponse,
  WorkerResource,
  WorkerResponse,
} from "./worker.interface.ts";
import {
  getAllWorkers,
  getWorker,
  getWorkersWithoutObjectives,
  getWorkersWithoutCategories,
  getWorkersWithoutCompetences,
  getMyConsultants,
  getBirthdays,
  findWorkerById,
} from "./worker.actions.ts";
import { WORKER } from "./worker.constant.ts";

const { QUERY_KEY } = WORKER;

export const useBirthday = (params?: Record<string, any>) => {
  return useQuery<PersonBirthdayResponse>({
    queryKey: ["birthday", params],
    queryFn: () => getBirthdays(),
  });
};

export const useWorkers = (params?: Record<string, any>) => {
  return useQuery<WorkerResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getWorker({ params }),
  });
};

export const useWorkerById = (id: number, params?: getWorkerProps) => {
  return useQuery<WorkerResource>({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findWorkerById(id, params),
  });
};

export const useAllWorkers = (
  params?: Record<string, any>,
  enabled: boolean = true,
) => {
  return useQuery<WorkerResource[]>({
    queryKey: [QUERY_KEY + "All", params],
    queryFn: () => getAllWorkers({ params }),

    enabled,
  });
};

export const useMyConsultants = (params?: Record<string, any>) => {
  return useQuery<WorkerResource[]>({
    queryKey: [QUERY_KEY, "my-consultants", params],
    queryFn: () => getMyConsultants({ params }),
  });
};

export const useWorkersWithoutObjectives = () => {
  return useQuery<WorkerResource[]>({
    queryKey: [QUERY_KEY + "WithoutObjectives"],
    queryFn: () => getWorkersWithoutObjectives(),
  });
};

export const useWorkersWithoutCategories = () => {
  return useQuery<WorkerResource[]>({
    queryKey: [QUERY_KEY + "WithoutCategories"],
    queryFn: () => getWorkersWithoutCategories(),
  });
};

export const useWorkersWithoutCompetences = () => {
  return useQuery<WorkerResource[]>({
    queryKey: [QUERY_KEY + "WithoutCompetences"],
    queryFn: () => getWorkersWithoutCompetences(),
  });
};
