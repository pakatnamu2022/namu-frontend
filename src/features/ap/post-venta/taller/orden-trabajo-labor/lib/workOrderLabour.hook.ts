import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { WORKER_ORDER_LABOUR } from "./workOrderLabour.constants";
import {
  WorkOrderLabourRequest,
  getWorkOrderLabourProps,
} from "./workOrderLabour.interface";
import {
  findWorkOrderLabourById,
  getAllWorkOrderLabour,
  getWorkOrderLabour,
  storeWorkOrderLabour,
  updateWorkOrderLabour,
  deleteWorkOrderLabour,
} from "./workOrderLabour.actions";
import {
  successToast,
  SUCCESS_MESSAGE,
  errorToast,
} from "@/core/core.function";

const { QUERY_KEY, MODEL } = WORKER_ORDER_LABOUR;

export function useGetWorkOrderLabour(props: getWorkOrderLabourProps) {
  return useQuery({
    queryKey: [QUERY_KEY, props],
    queryFn: () => getWorkOrderLabour(props),
  });
}

export function useGetAllWorkOrderLabour(params?: Record<string, any>) {
  return useQuery({
    queryKey: [QUERY_KEY, "all", params],
    queryFn: () => getAllWorkOrderLabour({ params }),
  });
}

export function useFindWorkOrderLabourById(id: number) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findWorkOrderLabourById(id),
    enabled: !!id,
  });
}

export function useStoreWorkOrderLabour() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: WorkOrderLabourRequest) => storeWorkOrderLabour(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: ["workOrder", Number(variables.work_order_id)],
      });
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        `Error al registrar ${
          MODEL.gender ? "la" : "el"
        } ${MODEL.name.toLowerCase()}`;
      errorToast(errorMessage);
    },
  });
}

export function useUpdateWorkOrderLabour() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: WorkOrderLabourRequest }) =>
      updateWorkOrderLabour(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["workOrder"] });
      successToast(
        `${MODEL.name} actualizad${MODEL.gender ? "a" : "o"} correctamente`
      );
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        `Error al actualizar ${
          MODEL.gender ? "la" : "el"
        } ${MODEL.name.toLowerCase()}`;
      errorToast(errorMessage);
    },
  });
}

export function useDeleteWorkOrderLabour() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteWorkOrderLabour(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["workOrder"] });
      successToast(
        `${MODEL.name} eliminad${MODEL.gender ? "a" : "o"} correctamente`
      );
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        `Error al eliminar ${
          MODEL.gender ? "la" : "el"
        } ${MODEL.name.toLowerCase()}`;
      errorToast(errorMessage);
    },
  });
}
