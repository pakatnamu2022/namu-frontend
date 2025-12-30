import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateWorkOrderPlanning,
  deleteWorkOrderPlanning,
  startSession,
  pauseWork,
  completeWork,
  cancelPlanning,
  storeWorkOrderPlanning,
  getWorkOrderPlanning,
  getConsolidatedPlanning,
} from "./workOrderPlanning.actions";
import {
  WorkOrderPlanningRequest,
  WorkOrderPlanningSessionRequest,
  PauseWorkRequest,
  WorkOrderPlanningResponse,
} from "./workOrderPlanning.interface";
import { WORK_ORDER_PLANNING } from "./workOrderPlanning.constants";

const { QUERY_KEY } = WORK_ORDER_PLANNING;

export const useGetWorkOrderPlanning = (params?: Record<string, any>) => {
  return useQuery<WorkOrderPlanningResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getWorkOrderPlanning({ params }),
    refetchOnWindowFocus: false,
  });
};

// Hook para crear planificación
export function useCreateWorkOrderPlanning() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: WorkOrderPlanningRequest) =>
      storeWorkOrderPlanning(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// Hook para actualizar planificación
export function useUpdateWorkOrderPlanning() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<WorkOrderPlanningRequest>;
    }) => updateWorkOrderPlanning(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// Hook para eliminar planificación
export function useDeleteWorkOrderPlanning() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteWorkOrderPlanning(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// Hook para iniciar sesión
export function useStartSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data?: WorkOrderPlanningSessionRequest;
    }) => startSession(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// Hook para pausar trabajo
export function usePauseWork() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data?: PauseWorkRequest }) =>
      pauseWork(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// Hook para completar trabajo
export function useCompleteWork() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => completeWork(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// Hook para cancelar planificación
export function useCancelPlanning() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => cancelPlanning(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// Hook para obtener planificación consolidada por orden de trabajo
export function useGetConsolidatedPlanning(workOrderId: number) {
  return useQuery({
    queryKey: [QUERY_KEY, "consolidated", workOrderId],
    queryFn: () => getConsolidatedPlanning(workOrderId),
    enabled: !!workOrderId,
  });
}
