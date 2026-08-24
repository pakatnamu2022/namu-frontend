import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getWorkerSubordinates } from "./team-hierarchy.actions";
import { WorkerHierarchyNode } from "./team-hierarchy.interface";

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
