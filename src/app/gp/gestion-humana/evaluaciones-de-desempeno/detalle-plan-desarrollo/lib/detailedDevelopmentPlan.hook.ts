import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllDetailedDevelopmentPlans,
  getDetailedDevelopmentPlans,
  findDetailedDevelopmentPlanById,
  storeDetailedDevelopmentPlan,
  updateDetailedDevelopmentPlan,
  deleteDetailedDevelopmentPlan,
} from "./detailedDevelopmentPlan.actions";
import { DETAILED_DEVELOPMENT_PLAN } from "./detailedDevelopmentPlan.constants";
import {
  StoreDetailedDevelopmentPlanRequest,
  UpdateDetailedDevelopmentPlanRequest,
} from "./detailedDevelopmentPlan.interface";

const { QUERY_KEY } = DETAILED_DEVELOPMENT_PLAN;

// Hook para obtener todos los planes de desarrollo (con paginación)
export function useDetailedDevelopmentPlans(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getDetailedDevelopmentPlans({ params }),
  });
}

// Hook para obtener todos los planes de desarrollo (sin paginación)
export function useAllDetailedDevelopmentPlans(
  params?: Record<string, unknown>
) {
  return useQuery({
    queryKey: [QUERY_KEY, "all", params],
    queryFn: () => getAllDetailedDevelopmentPlans(params),
  });
}

// Hook para obtener un plan de desarrollo por ID
export function useDetailedDevelopmentPlan(id?: number) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findDetailedDevelopmentPlanById(id!),
    enabled: !!id,
  });
}

// Hook para crear un plan de desarrollo
export function useStoreDetailedDevelopmentPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StoreDetailedDevelopmentPlanRequest) =>
      storeDetailedDevelopmentPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// Hook para actualizar un plan de desarrollo
export function useUpdateDetailedDevelopmentPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateDetailedDevelopmentPlanRequest;
    }) => updateDetailedDevelopmentPlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// Hook para eliminar un plan de desarrollo
export function useDeleteDetailedDevelopmentPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteDetailedDevelopmentPlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}
