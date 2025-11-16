import { useQuery } from "@tanstack/react-query";
import { AUDIT_LOGS } from "./auditLogs.constants";
import { AuditLogsResource, AuditLogsResponse } from "./auditLogs.interface";
import {
  findAuditLogsById,
  getAllAuditLogs,
  getAuditLogs,
} from "./auditLogs.actions";

const { QUERY_KEY } = AUDIT_LOGS;

export const useAuditLogs = (params?: Record<string, any>) => {
  return useQuery<AuditLogsResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getAuditLogs({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllAuditLogs = (params?: Record<string, any>) => {
  return useQuery<AuditLogsResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllAuditLogs({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAuditLogsById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findAuditLogsById(id),
    refetchOnWindowFocus: false,
  });
};
