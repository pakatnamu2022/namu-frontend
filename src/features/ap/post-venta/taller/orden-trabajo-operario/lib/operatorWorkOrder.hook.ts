import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { OPERATOR_WORKER_ORDER } from "./operatorWorkOrder.constants";
import {
  getOperatorWorkOrderProps,
  OperatorWorkOrderRequest,
} from "./operatorWorkOrder.interface";
import {
  findOperatorWorkOrderById,
  getAllOperatorWorkOrder,
  getOperatorWorkOrder,
  storeOperatorWorkOrder,
  updateOperatorWorkOrder,
} from "./operatorWorkOrder.actions";
import {
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";

const { QUERY_KEY, MODEL } = OPERATOR_WORKER_ORDER;

export function useGetOperatorWorkOrder(props: getOperatorWorkOrderProps) {
  return useQuery({
    queryKey: [QUERY_KEY, props],
    queryFn: () => getOperatorWorkOrder(props),
  });
}

export function useGetAllOperatorWorkOrder(props: getOperatorWorkOrderProps) {
  return useQuery({
    queryKey: [QUERY_KEY, "all", props],
    queryFn: () => getAllOperatorWorkOrder(props),
  });
}

export function useFindOperatorWorkOrderById(id: number) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findOperatorWorkOrderById(id),
    enabled: !!id,
  });
}

export function useStoreOperatorWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: OperatorWorkOrderRequest) =>
      storeOperatorWorkOrder(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: ["workOrder", variables.work_order_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["workOrderAssignOperators", variables.work_order_id],
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

export function useUpdateOperatorWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: OperatorWorkOrderRequest;
    }) => updateOperatorWorkOrder(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
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
