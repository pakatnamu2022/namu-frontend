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
} from "./workOrderPlanning.actions";
import {
  WorkOrderPlanningRequest,
  WorkOrderPlanningSessionRequest,
  PauseWorkRequest,
  WorkOrderPlanningResponse,
} from "./workOrderPlanning.interface";
import {
  MOCK_PLANNING_DATA,
  WORK_ORDER_PLANNING,
} from "./workOrderPlanning.constants";

const { QUERY_KEY } = WORK_ORDER_PLANNING;

export const useGetWorkOrderPlanning = (params?: Record<string, any>) => {
  return useQuery<WorkOrderPlanningResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getWorkOrderPlanning({ params }),
    refetchOnWindowFocus: false,
  });
};

// Hook para obtener una planificación por ID
export function useGetWorkOrderPlanningById(id: number) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => {
      // Usar datos mockeados
      const planning = MOCK_PLANNING_DATA.find((p) => p.id === id);
      if (!planning) {
        throw new Error("Planning not found");
      }
      return Promise.resolve(planning);
      // Para conectar con la API real, descomentar:
      // return getWorkOrderPlanningById(id);
    },
    enabled: !!id,
  });
}

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

// Hook para obtener sesiones
export function useGetSessions(id: number) {
  return useQuery({
    queryKey: [QUERY_KEY, id, "sessions"],
    queryFn: () => {
      // Usar datos mockeados
      const planning = MOCK_PLANNING_DATA.find((p) => p.id === id);
      return Promise.resolve(planning?.sessions || []);
      // Para conectar con la API real, descomentar:
      // return getSessions(id);
    },
    enabled: !!id,
  });
}
