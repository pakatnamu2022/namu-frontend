import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  deleteWorkOrder,
  findWorkOrderById,
  getAllWorkOrder,
  getWorkOrder,
  storeWorkOrder,
  downloadWorkOrderPdf,
} from "./workOrder.actions";
import { getWorkOrderProps, WorkOrderRequest } from "./workOrder.interface";
import { WORKER_ORDER } from "./workOrder.constants";

const { QUERY_KEY, MODEL } = WORKER_ORDER;

export function useGetWorkOrder(props: getWorkOrderProps) {
  return useQuery({
    queryKey: [QUERY_KEY, props],
    queryFn: () => getWorkOrder(props),
  });
}

export function useGetAllWorkOrder(props: getWorkOrderProps) {
  return useQuery({
    queryKey: [QUERY_KEY, "all", props],
    queryFn: () => getAllWorkOrder(props),
  });
}

export function useFindWorkOrderById(id: number) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findWorkOrderById(id),
    enabled: !!id,
  });
}

export function useStoreWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: WorkOrderRequest) => storeWorkOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success(`${MODEL.name} registrad${MODEL.gender ? "a" : "o"}`);
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        `Error al registrar ${
          MODEL.gender ? "la" : "el"
        } ${MODEL.name.toLowerCase()}`;
      toast.error(errorMessage);
    },
  });
}

export function useDeleteWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteWorkOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success(`${MODEL.name} eliminad${MODEL.gender ? "a" : "o"}`);
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        `Error al eliminar ${
          MODEL.gender ? "la" : "el"
        } ${MODEL.name.toLowerCase()}`;
      toast.error(errorMessage);
    },
  });
}

export function useDownloadWorkOrderPdf() {
  return useMutation({
    mutationFn: (id: number) => downloadWorkOrderPdf(id),
    onSuccess: () => {
      toast.success("PDF descargado correctamente");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Error al descargar el PDF";
      toast.error(errorMessage);
    },
  });
}
