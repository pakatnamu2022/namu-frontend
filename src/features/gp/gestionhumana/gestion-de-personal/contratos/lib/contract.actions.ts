import { api } from "@/core/api.ts";
import { GeneralResponse } from "@/shared/lib/response.interface.ts";
import type { AxiosRequestConfig } from "axios";
import {
  getContractsProps,
  ContractResource,
  ContractResponse,
} from "./contract.interface.ts";
import { CONTRACT } from "./contract.constant.ts";

const { ENDPOINT } = CONTRACT;

export async function getContracts({
  params,
}: getContractsProps): Promise<ContractResponse> {
  const config: AxiosRequestConfig = { params: { ...params } };
  const { data } = await api.get<ContractResponse>(ENDPOINT, config);
  return data;
}

export async function findContractById(id: string): Promise<ContractResource> {
  const { data } = await api.get<ContractResource>(`${ENDPOINT}/${id}`);
  return data;
}

export async function storeContract(
  payload: any,
): Promise<{ data: ContractResource }> {
  const { data } = await api.post<{ data: ContractResource }>(ENDPOINT, payload);
  return data;
}

export async function updateContract(
  id: string,
  payload: any,
): Promise<{ data: ContractResource }> {
  const { data } = await api.put<{ data: ContractResource }>(
    `${ENDPOINT}/${id}`,
    payload,
  );
  return data;
}

export async function deleteContract(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}

export async function openContractPdf(id: number): Promise<void> {
  const response = await api.get(`${ENDPOINT}/${id}/pdf`, {
    responseType: "blob",
  });
  const url = URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
  window.open(url, "_blank");
}

export async function requestContractApproval(
  id: number,
): Promise<{ data: ContractResource }> {
  const { data } = await api.post<{ data: ContractResource }>(
    `${ENDPOINT}/${id}/request-approval`,
  );
  return data;
}

export async function sendContractToWorker(
  id: number,
): Promise<{ data: ContractResource }> {
  const { data } = await api.post<{ data: ContractResource }>(
    `${ENDPOINT}/${id}/send-to-worker`,
  );
  return data;
}

export async function signContractBatch(
  lote: string,
  firmante_id: number,
): Promise<{ data: Array<{ id: number; ok: boolean; error?: string }> }> {
  const { data } = await api.post(`${ENDPOINT}/sign-batch`, {
    lote,
    firmante_id,
  });
  return data;
}

export async function downloadSignedContract(
  id: number,
  filename: string = `contrato_firmado_${id}.pdf`,
): Promise<void> {
  const response = await api.get(`${ENDPOINT}/${id}/download-signed`, {
    responseType: "blob",
  });
  const url = URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export interface ExpiringContract {
  id: number;
  sede: string | null;
  trabajador: string | null;
  fecha_fin_contrato: string;
  dias: number;
}

export async function getExpiringContracts(
  days: number = 50,
): Promise<{ data: ExpiringContract[] }> {
  const { data } = await api.get(`${ENDPOINT}/expiring`, { params: { days } });
  return data;
}
