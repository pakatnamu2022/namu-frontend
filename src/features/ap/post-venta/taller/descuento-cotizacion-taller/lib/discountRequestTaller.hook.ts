import { useQuery } from "@tanstack/react-query";
import {
  getDiscountRequestsByWorkOrderQuotation,
  getDiscountRequestsByWorkOrder,
} from "./discountRequestTaller.actions";
import { DISCOUNT_REQUEST_TALLER } from "./discountRequestTaller.constants";

export function useDiscountRequestsByWorkOrderQuotation(quotationId: number) {
  return useQuery({
    queryKey: [DISCOUNT_REQUEST_TALLER.QUERY_KEY, quotationId],
    queryFn: () => getDiscountRequestsByWorkOrderQuotation(quotationId),
    enabled: !!quotationId,
  });
}

export function useDiscountRequestsByWorkOrder(workOrderId: number) {
  return useQuery({
    queryKey: [DISCOUNT_REQUEST_TALLER.QUERY_KEY, "work-order", workOrderId],
    queryFn: () => getDiscountRequestsByWorkOrder(workOrderId),
    enabled: !!workOrderId,
  });
}
