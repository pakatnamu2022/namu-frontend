import { useQuery } from "@tanstack/react-query";
import {
  getWorkerProps,
  PersonBirthdayResponse,
  WorkerContractsSummary,
  WorkerResource,
  WorkerResponse,
  WorkerVacationResource,
} from "./worker.interface.ts";
import { type UserCompleteResource } from "@/features/gp/gestionsistema/usuarios/lib/user.interface.ts";
import {
  getAllWorkers,
  getWorker,
  getWorkersWithoutObjectives,
  getWorkersWithoutCategories,
  getWorkersWithoutCompetences,
  getMyConsultants,
  getBirthdays,
  findWorkerById,
  getWorkerComplete,
  getWorkerContractsSummary,
  getWorkerVacations,
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

export const useWorkerById = (
  id: number,
  params?: getWorkerProps,
  enabled: boolean = true,
) => {
  return useQuery<WorkerResource>({
    queryKey: [QUERY_KEY, id, params],
    queryFn: () => findWorkerById(id, params),
    enabled: enabled && id > 0,
  });
};

export const useWorkerComplete = (id: number) => {
  return useQuery<UserCompleteResource>({
    queryKey: [QUERY_KEY, id, "complete"],
    queryFn: () => getWorkerComplete(id),
    enabled: id > 0,
    refetchOnWindowFocus: false,
  });
};

export const useWorkerContractsSummary = (id: number) => {
  return useQuery<WorkerContractsSummary>({
    queryKey: [QUERY_KEY, id, "contracts-summary"],
    queryFn: () => getWorkerContractsSummary(id),
    enabled: id > 0,
    refetchOnWindowFocus: false,
  });
};

export const useWorkerVacations = (id: number) => {
  return useQuery<WorkerVacationResource[]>({
    queryKey: [QUERY_KEY, id, "vacations"],
    queryFn: () => getWorkerVacations(id),
    enabled: id > 0,
    refetchOnWindowFocus: false,
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
