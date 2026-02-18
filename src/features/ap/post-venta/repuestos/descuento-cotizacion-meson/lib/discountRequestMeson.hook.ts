import { useQuery } from "@tanstack/react-query";
import { getDiscountRequestsByQuotation } from "./discountRequestMeson.actions";
import { DISCOUNT_REQUEST_MESON } from "./discountRequestMeson.constants";

export function useDiscountRequestsByQuotation(quotationId: number) {
  return useQuery({
    queryKey: [DISCOUNT_REQUEST_MESON.QUERY_KEY, quotationId],
    queryFn: () => getDiscountRequestsByQuotation(quotationId),
    enabled: !!quotationId,
  });
}
