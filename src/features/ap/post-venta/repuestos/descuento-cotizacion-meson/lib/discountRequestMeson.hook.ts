import { useQuery } from "@tanstack/react-query";
import { DISCOUNT_REQUEST_MESON } from "./discountRequestMeson.constants";
import { getAllDiscountRequestsQuotation } from "./discountRequestMeson.actions";
import { DiscountRequestOrderQuotationResource } from "./discountRequestMeson.interface";

export const useDiscountRequestsQuotation = (params?: Record<string, any>) => {
  return useQuery<DiscountRequestOrderQuotationResource[]>({
    queryKey: [DISCOUNT_REQUEST_MESON.QUERY_KEY, params],
    queryFn: () => getAllDiscountRequestsQuotation({ params }),
    refetchOnWindowFocus: false,
  });
};
