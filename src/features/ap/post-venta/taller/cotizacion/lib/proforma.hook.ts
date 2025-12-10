import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { ORDER_QUOTATION } from "./proforma.constants";
import {
  getAllOrderQuotations,
  storeOrderQuotation,
  updateOrderQuotation,
  deleteOrderQuotation,
  getOrderQuotations,
  findOrderQuotationById,
} from "./proforma.actions";
import { OrderQuotationRequest } from "./proforma.interface";

const { MODEL, QUERY_KEY } = ORDER_QUOTATION;

export const useAllOrderQuotations = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: [QUERY_KEY, "all", params],
    queryFn: () => getAllOrderQuotations({ params }),
  });
};

export const useOrderQuotations = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getOrderQuotations({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useOrderQuotationById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findOrderQuotationById(id),
    enabled: !!id,
  });
};

export const useStoreOrderQuotation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: OrderQuotationRequest) => storeOrderQuotation(data),
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["workOrder"] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(msg || `Error al crear ${MODEL.name}`);
    },
  });
};

export const useUpdateOrderQuotation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: OrderQuotationRequest }) =>
      updateOrderQuotation(id, data),
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["workOrder"] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(msg || `Error al actualizar ${MODEL.name}`);
    },
  });
};

export const useDeleteOrderQuotation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteOrderQuotation(id),
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["workOrder"] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(msg || `Error al eliminar ${MODEL.name}`);
    },
  });
};
