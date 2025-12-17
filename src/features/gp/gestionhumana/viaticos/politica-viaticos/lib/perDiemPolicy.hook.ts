import { useQuery } from "@tanstack/react-query";
import { PER_DIEM_POLICY } from "./perDiemPolicy.constants";
import { getPerDiemPolicyProps } from "./perDiemPolicy.interface";
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

export function useGetAllPerDiemPolicy(props: getPerDiemPolicyProps) {
  return useQuery({
    queryKey: [QUERY_KEY, "all", props],
    queryFn: () => getAllPerDiemPolicy(props),
  });
}

export function useFindPerDiemPolicyById(id: number) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findPerDiemPolicyById(id),
    enabled: !!id,
  });
}
