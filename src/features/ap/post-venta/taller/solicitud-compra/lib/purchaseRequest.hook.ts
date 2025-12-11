import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PURCHASE_REQUEST } from "./purchaseRequest.constants";
import {
  getPurchaseRequests,
  deletePurchaseRequest,
  getAllPurchaseRequests,
} from "./purchaseRequest.actions";
import {
  errorToast,
  successToast,
  ERROR_MESSAGE,
  SUCCESS_MESSAGE,
} from "@/core/core.function";
import { PurchaseRequestResponse } from "./purchaseRequest.interface";

const { QUERY_KEY, MODEL } = PURCHASE_REQUEST;

export const usePurchaseRequests = (params?: Record<string, any>) => {
  return useQuery<PurchaseRequestResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getPurchaseRequests({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllPurchaseRequests = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: [QUERY_KEY, "all", params],
    queryFn: () => getAllPurchaseRequests({ params }),
  });
};

export const useDeletePurchaseRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePurchaseRequest,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "delete", msg));
    },
  });
};
