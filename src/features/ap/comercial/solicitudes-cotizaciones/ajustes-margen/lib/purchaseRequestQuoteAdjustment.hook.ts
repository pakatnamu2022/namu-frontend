import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PURCHASE_REQUEST_QUOTE_ADJUSTMENT } from "./purchaseRequestQuoteAdjustment.constants";
import {
  AdjustmentRequestResource,
  AdjustmentRequestResponse,
  CreateAdjustmentRequestPayload,
} from "./purchaseRequestQuoteAdjustment.interface";
import {
  approveAdjustmentRequest,
  cancelAdjustmentRequest,
  findAdjustmentRequestById,
  getAdjustmentRequests,
  rejectAdjustmentRequest,
  storeAdjustmentRequest,
} from "./purchaseRequestQuoteAdjustment.actions";

const { QUERY_KEY } = PURCHASE_REQUEST_QUOTE_ADJUSTMENT;
const PURCHASE_REQUEST_QUOTE_QUERY_KEY = "purchaseRequestQuote";

export const useAdjustmentRequests = (params?: Record<string, any>) => {
  return useQuery<AdjustmentRequestResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getAdjustmentRequests({ params }),
  });
};

export const useAdjustmentRequestById = (id: number) => {
  return useQuery<AdjustmentRequestResource>({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findAdjustmentRequestById(id),
    enabled: !!id && id > 0,
  });
};

export const useCreateAdjustmentRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAdjustmentRequestPayload) =>
      storeAdjustmentRequest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [PURCHASE_REQUEST_QUOTE_QUERY_KEY],
      });
    },
  });
};

export const useApproveAdjustmentRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => approveAdjustmentRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [PURCHASE_REQUEST_QUOTE_QUERY_KEY],
      });
    },
  });
};

export const useRejectAdjustmentRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      rejectAdjustmentRequest(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};

export const useCancelAdjustmentRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => cancelAdjustmentRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};
