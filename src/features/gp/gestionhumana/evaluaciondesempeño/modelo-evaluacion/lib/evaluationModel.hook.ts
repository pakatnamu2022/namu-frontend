import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  deleteEvaluationModel,
  findEvaluationModelById,
  getAllEvaluationModels,
  getEvaluationModels,
  storeEvaluationModel,
  updateEvaluationModel,
} from "./evaluationModel.actions";
import { EVALUATION_MODEL } from "./evaluationModel.constants";
import type { getEvaluationModelsProps } from "./evaluationModel.interface";
import { useNavigate } from "react-router-dom";

const { QUERY_KEY, ABSOLUTE_ROUTE, MODEL } = EVALUATION_MODEL;

export function useEvaluationModels({ params }: getEvaluationModelsProps = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getEvaluationModels({ params }),
  });
}

export function useAllEvaluationModels() {
  return useQuery({
    queryKey: [QUERY_KEY, "all"],
    queryFn: () => getAllEvaluationModels(),
  });
}

export function useEvaluationModelById(id: number) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findEvaluationModelById(id),
    enabled: !!id,
  });
}

export function useStoreEvaluationModel() {
  const queryClient = useQueryClient();
  const router = useNavigate();

  return useMutation({
    mutationFn: storeEvaluationModel,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success(response.message || `${MODEL.name} creado correctamente`);
      router(ABSOLUTE_ROUTE);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        `Error al crear ${MODEL.name.toLowerCase()}`;
      toast.error(message);
    },
  });
}

export function useUpdateEvaluationModel(id: string) {
  const queryClient = useQueryClient();
  const router = useNavigate();

  return useMutation({
    mutationFn: (data: any) => updateEvaluationModel(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success(
        response.message || `${MODEL.name} actualizado correctamente`
      );
      router(ABSOLUTE_ROUTE);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        `Error al actualizar ${MODEL.name.toLowerCase()}`;
      toast.error(message);
    },
  });
}

export function useDeleteEvaluationModel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEvaluationModel,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success(
        response.message || `${MODEL.name} eliminado correctamente`
      );
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        `Error al eliminar ${MODEL.name.toLowerCase()}`;
      toast.error(message);
    },
  });
}
