import { useQuery } from "@tanstack/react-query";
import { PER_DIEM_POLICY } from "./perDiemPolicy.constants";
import {
  getPerDiemPolicyProps,
  PerDiemPolicyResource,
} from "./perDiemPolicy.interface";
import {
  findPerDiemPolicyById,
  getAllPerDiemPolicy,
  getPerDiemPolicy,
} from "./perDiemPolicy.actions";

const { QUERY_KEY } = PER_DIEM_POLICY;

export function useGetPerDiemPolicy(props: getPerDiemPolicyProps) {
  return useQuery({
    queryKey: [QUERY_KEY, props],
    queryFn: () => getPerDiemPolicy(props),
  });
}

export function useGetAllPerDiemPolicy(params?: Record<string, any>) {
  return useQuery<PerDiemPolicyResource[]>({
    queryKey: [QUERY_KEY, "all", params],
    queryFn: () => getAllPerDiemPolicy({ params }),
  });
}

export function useFindPerDiemPolicyById(id: number) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findPerDiemPolicyById(id),
    enabled: !!id,
  });
}
