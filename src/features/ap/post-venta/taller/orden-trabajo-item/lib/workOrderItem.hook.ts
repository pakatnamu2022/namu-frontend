import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { WORKER_ORDER_ITEM } from "./workOrderItem.constants";
import {
  getWorkOrderItemProps,
  WorkOrderItemRequest,
} from "./workOrderItem.interface";
import {
  findWorkOrderItemById,
  getAllWorkOrderItem,
  getWorkOrderItem,
  storeWorkOrderItem,
  updateWorkOrderItem,
} from "./workOrderItem.actions";
import { SUCCESS_MESSAGE, successToast } from "@/core/core.function";

const { QUERY_KEY, MODEL } = WORKER_ORDER_ITEM;

export function useGetWorkOrderItem(props: getWorkOrderItemProps) {
  return useQuery({
    queryKey: [QUERY_KEY, props],
    queryFn: () => getWorkOrderItem(props),
  });
}

export function useGetAllWorkOrderItem(props: getWorkOrderItemProps) {
  return useQuery({
    queryKey: [QUERY_KEY, "all", props],
    queryFn: () => getAllWorkOrderItem(props),
  });
}

export function useFindWorkOrderItemById(id: number) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findWorkOrderItemById(id),
    enabled: !!id,
  });
}

export function useStoreWorkOrderItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: WorkOrderItemRequest) => storeWorkOrderItem(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: ["workOrder", variables.work_order_id],
      });
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
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

export function useUpdateWorkOrderItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: WorkOrderItemRequest }) =>
      updateWorkOrderItem(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
      toast.success(`${MODEL.name} actualizad${MODEL.gender ? "a" : "o"}`);
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        `Error al actualizar ${
          MODEL.gender ? "la" : "el"
        } ${MODEL.name.toLowerCase()}`;
      toast.error(errorMessage);
    },
  });
}
