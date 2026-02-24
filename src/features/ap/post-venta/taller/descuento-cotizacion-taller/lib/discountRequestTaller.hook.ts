import { useQuery } from "@tanstack/react-query";
import { getDiscountRequestsByWorkOrderQuotation } from "./discountRequestTaller.actions";
import { DISCOUNT_REQUEST_TALLER } from "./discountRequestTaller.constants";

export function useDiscountRequestsByWorkOrderQuotation(quotationId: number) {
  return useQuery({
    queryKey: [DISCOUNT_REQUEST_TALLER.QUERY_KEY, quotationId],
    queryFn: () => getDiscountRequestsByWorkOrderQuotation(quotationId),
    enabled: !!quotationId,
  });
}
