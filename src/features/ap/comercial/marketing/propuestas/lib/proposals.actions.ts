import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { PROPOSALS } from "./proposals.constants";
import {
  ProposalsResource,
  ProposalsResponse,
  getProposalsProps,
} from "./proposals.interface";
import { ProposalsSchema } from "./proposals.schema";

const { ENDPOINT } = PROPOSALS;

export async function getProposals({
  params,
}: getProposalsProps): Promise<ProposalsResponse> {
  const config: AxiosRequestConfig = { params: { ...params } };
  const { data } = await api.get<ProposalsResponse>(ENDPOINT, config);
  return data;
}

export async function getAllProposals({
  params,
}: getProposalsProps = {}): Promise<ProposalsResource[]> {
  const config: AxiosRequestConfig = { params: { all: true, ...params } };
  const { data } = await api.get<ProposalsResource[]>(ENDPOINT, config);
  return data;
}

export async function findProposalsById(
  id: number,
): Promise<ProposalsResource> {
  const { data } = await api.get<ProposalsResource>(`${ENDPOINT}/${id}`);
  return data;
}

export async function storeProposals(
  payload: ProposalsSchema,
): Promise<ProposalsResource> {
  const { data } = await api.post<ProposalsResource>(ENDPOINT, payload);
  return data;
}

export async function updateProposals(
  id: number,
  payload: Partial<ProposalsSchema>,
): Promise<ProposalsResource> {
  const { data } = await api.put<ProposalsResource>(
    `${ENDPOINT}/${id}`,
    payload,
  );
  return data;
}

export async function deleteProposals(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}

export async function approveProposal(id: number): Promise<ProposalsResource> {
  const { data } = await api.post<ProposalsResource>(`${ENDPOINT}/${id}/approve`);
  return data;
}

export async function rejectProposal(id: number): Promise<ProposalsResource> {
  const { data } = await api.post<ProposalsResource>(`${ENDPOINT}/${id}/reject`);
  return data;
}
