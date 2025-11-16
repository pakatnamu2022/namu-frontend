import { AxiosRequestConfig } from "axios";
import { api } from "@/src/core/api";
import { STATUS_ACTIVE } from "@/src/core/core.constants";
import { AUDIT_LOGS } from "./auditLogs.constants";
import {
  AuditLogsResource,
  AuditLogsResponse,
  getAuditLogsProps,
} from "./auditLogs.interface";

const { ENDPOINT } = AUDIT_LOGS;

export async function getAuditLogs({
  params,
}: getAuditLogsProps): Promise<AuditLogsResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<AuditLogsResponse>(ENDPOINT, config);
  return data;
}

export async function getAllAuditLogs({
  params,
}: getAuditLogsProps): Promise<AuditLogsResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
      ...params,
      status: STATUS_ACTIVE,
    },
  };
  const { data } = await api.get<AuditLogsResource[]>(ENDPOINT, config);
  return data;
}

export async function findAuditLogsById(
  id: number
): Promise<AuditLogsResource> {
  const response = await api.get<AuditLogsResource>(`${ENDPOINT}/${id}`);
  return response.data;
}
