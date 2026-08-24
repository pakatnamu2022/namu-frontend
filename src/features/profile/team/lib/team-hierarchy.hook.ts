import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getWorkerSubordinates,
  searchWorkerHierarchy,
} from "./team-hierarchy.actions";
import {
  WorkerHierarchyNode,
  WorkerHierarchySearchResult,
} from "./team-hierarchy.interface";

export const workerSubordinatesQueryKey = (id: number) => [
  "worker-subordinates",
  id,
];

export const useWorkerSubordinates = (id?: number, enabled = true) => {
  return useQuery<WorkerHierarchyNode[]>({
    queryKey: workerSubordinatesQueryKey(id ?? 0),
    queryFn: () => getWorkerSubordinates(id as number),
    enabled: !!id && enabled,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook auxiliar para pedir, bajo demanda, los subordinados de un nodo
 * cuando el usuario lo expande en el árbol de jerarquía.
 */
export const useExpandHierarchyNode = () => {
  const queryClient = useQueryClient();

  return (id: number) =>
    queryClient.fetchQuery({
      queryKey: workerSubordinatesQueryKey(id),
      queryFn: () => getWorkerSubordinates(id),
    });
};

/**
 * Busca personas por nombre dentro del árbol de jerarquía a partir de la
 * raíz, para el buscador del árbol.
 */
export const useSearchHierarchy = (rootId: number, term: string) => {
  return useQuery<WorkerHierarchySearchResult[]>({
    queryKey: ["worker-hierarchy-search", rootId, term],
    queryFn: () => searchWorkerHierarchy(rootId, term),
    enabled: term.trim().length >= 2,
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });
};
