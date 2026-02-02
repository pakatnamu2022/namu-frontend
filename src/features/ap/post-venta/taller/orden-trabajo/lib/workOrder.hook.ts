import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteWorkOrder,
  findWorkOrderById,
  getAllWorkOrder,
  getWorkOrder,
  storeWorkOrder,
  downloadWorkOrderPdf,
  getPaymentSummary,
  authorizationWorkOrder,
} from "./workOrder.actions";
import { getWorkOrderProps, WorkOrderRequest } from "./workOrder.interface";
import { WORKER_ORDER } from "./workOrder.constants";
import { errorToast, successToast } from "@/core/core.function";

const { QUERY_KEY, MODEL } = WORKER_ORDER;

export function useGetWorkOrder(props: getWorkOrderProps) {
  return useQuery({
    queryKey: [QUERY_KEY, props],
    queryFn: () => getWorkOrder(props),
  });
}

export function useGetAllWorkOrder(params?: Record<string, any>) {
  return useQuery({
    queryKey: [QUERY_KEY, "all", params],
    queryFn: () => getAllWorkOrder({ params }),
  });
}

export function useFindWorkOrderById(id: number) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findWorkOrderById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos - evita refetches innecesarios
    refetchOnWindowFocus: false,
  });
}

export function useStoreWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: WorkOrderRequest) => storeWorkOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      successToast(`${MODEL.name} registrad${MODEL.gender ? "a" : "o"}`);
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

export function useAuthorizationWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<WorkOrderRequest>;
    }) => authorizationWorkOrder(id, data as WorkOrderRequest),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      successToast(`${MODEL.name} actualizad${MODEL.gender ? "a" : "o"}`);
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

export function useDeleteWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteWorkOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      successToast(`${MODEL.name} eliminad${MODEL.gender ? "a" : "o"}`);
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

export function useDownloadWorkOrderPdf() {
  return useMutation({
    mutationFn: (id: number) => downloadWorkOrderPdf(id),
    onSuccess: () => {
      successToast("PDF descargado correctamente");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Error al descargar el PDF";
      errorToast(errorMessage);
    },
  });
}

export function useGetPaymentSummary(
  workOrderId: number,
  groupNumber?: number,
) {
  return useQuery({
    queryKey: [QUERY_KEY, "payment-summary", workOrderId, groupNumber],
    queryFn: () => getPaymentSummary(workOrderId, groupNumber),
    enabled: !!workOrderId,
  });
}
