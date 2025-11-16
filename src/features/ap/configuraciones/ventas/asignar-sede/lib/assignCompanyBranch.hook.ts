import { useQuery } from "@tanstack/react-query";
import {
  findAssignCompanyBranchById,
  getAllWorkersBySede,
  getAssignCompanyBranch,
} from "./assignCompanyBranch.actions";
import { AssignCompanyBranchResponse } from "./assignCompanyBranch.interface";
import { ASSIGN_COMPANY_BRANCH } from "./assignCompanyBranch.constants";
import { WorkerResource } from "@/src/features/gp/gestionhumana/personal/trabajadores/lib/worker.interface";

const { QUERY_KEY } = ASSIGN_COMPANY_BRANCH;

export const useAssignCompanyBranch = (params?: Record<string, any>) => {
  return useQuery<AssignCompanyBranchResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getAssignCompanyBranch({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAssignCompanyBranchById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findAssignCompanyBranchById(id),
    refetchOnWindowFocus: false,
  });
};

export const useAllWorkersBySede = (idSede?: number) => {
  return useQuery<WorkerResource[]>({
    queryKey: [QUERY_KEY, idSede],
    queryFn: () => getAllWorkersBySede(idSede!),
    refetchOnWindowFocus: false,
    enabled: !!idSede,
  });
};
