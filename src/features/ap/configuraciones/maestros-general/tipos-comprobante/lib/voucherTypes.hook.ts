import { useQuery } from "@tanstack/react-query";
import { VOUCHER_TYPE } from "./voucherTypes.constants";
import {
  VoucherTypesResource,
  VoucherTypesResponse,
} from "./voucherTypes.interface";
import {
  findVoucherTypesById,
  getAllVoucherTypes,
  getVoucherTypes,
} from "./voucherTypes.actions";

const { QUERY_KEY } = VOUCHER_TYPE;

export const useVoucherTypes = (params?: Record<string, any>) => {
  return useQuery<VoucherTypesResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getVoucherTypes({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllVoucherTypes = (params?: Record<string, any>) => {
  return useQuery<VoucherTypesResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllVoucherTypes({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useVoucherTypesById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findVoucherTypesById(id),
    refetchOnWindowFocus: false,
  });
};
