import { useQuery } from "@tanstack/react-query";
import { getPerDiemRequestProps } from "./perDiemRequest.interface";
import { PER_DIEM_REQUEST } from "./perDiemRequest.constants";
import {
  findPerDiemRequestById,
  getAllPerDiemRequest,
  getPendingApprovals,
  getPendingSettlements,
  getPerDiemRequest,
} from "./perDiemRequest.actions";

const { QUERY_KEY } = PER_DIEM_REQUEST;

export function useGetPerDiemRequest(props: getPerDiemRequestProps) {
  return useQuery({
    queryKey: [QUERY_KEY, props],
    queryFn: () => getPerDiemRequest(props),
  });
}

export function useGetAllPerDiemRequest(props: getPerDiemRequestProps) {
  return useQuery({
    queryKey: [QUERY_KEY, "all", props],
    queryFn: () => getAllPerDiemRequest(props),
  });
}

export function useFindPerDiemRequestById(id: number) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findPerDiemRequestById(id),
    enabled: !!id,
  });
}

export function useGetPendingApprovals(props: getPerDiemRequestProps) {
  return useQuery({
    queryKey: [QUERY_KEY, "pending-approvals", props],
    queryFn: () => getPendingApprovals(props),
  });
}

export function useGetPendingSettlements(props: getPerDiemRequestProps) {
  return useQuery({
    queryKey: [QUERY_KEY, "pending-settlements", props],
    queryFn: () => getPendingSettlements(props),
  });
}
