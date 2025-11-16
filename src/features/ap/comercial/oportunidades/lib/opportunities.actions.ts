import {
  OpportunitiesResponse,
  OpportunityResource,
  GetOpportunitiesProps,
  GetMyOpportunitiesProps,
  GetMyAgendaProps,
  MyAgendaResponse,
  CommercialMastersResponse,
} from "./opportunities.interface";
import { OPPORTUNITIES, OPPORTUNITY_ACTIONS } from "./opportunities.constants";
import { api } from "@/src/core/api";
import { COMMERCIAL_MASTERS_ENDPOINT } from "../../../lib/ap.constants";
import { OpportunityActionResource } from "./opportunityAction.interface";
import {
  OpportunityActionSchema,
  OpportunitySchema,
} from "./opportunities.schema";
import { ParamsProps } from "@/src/core/core.interface";

const { ENDPOINT } = OPPORTUNITIES;
const { ENDPOINT: ACTIONS_ENDPOINT } = OPPORTUNITY_ACTIONS;

// ==================== OPPORTUNITIES ====================

// Get all opportunities
export const getOpportunities = async ({
  params,
}: GetOpportunitiesProps): Promise<OpportunitiesResponse> => {
  const response = await api.get(ENDPOINT, { params });
  return response.data;
};

// Get my opportunities
export const getMyOpportunities = async (
  params: GetMyOpportunitiesProps
): Promise<OpportunityResource[]> => {
  const response = await api.get(`${ENDPOINT}/my`, {
    params,
  });
  return response.data;
};

// Get my agenda
export const getMyAgenda = async (
  params: GetMyAgendaProps
): Promise<MyAgendaResponse> => {
  const { data } = await api.get(`${ENDPOINT}/agenda/my`, {
    params,
  });
  return data;
};

// Get opportunity by ID
export const getOpportunity = async (
  id: number
): Promise<OpportunityResource> => {
  const response = await api.get<OpportunityResource>(`${ENDPOINT}/${id}`);
  return response.data;
};

// Get opportunity actions
export const getOpportunityActions = async (
  opportunityId: number
): Promise<OpportunityActionResource[]> => {
  const response = await api.get<OpportunityActionResource[]>(
    `${ENDPOINT}/${opportunityId}/actions`
  );
  return response.data;
};

// Create opportunity
export const createOpportunity = async (
  data: OpportunitySchema
): Promise<OpportunityResource> => {
  const response = await api.post(ENDPOINT, data);
  // Check if the response has the expected structure
  if (response.data?.data) {
    return response.data.data;
  }
  // If not, return response.data directly (some APIs return data directly)
  return response.data;
};

// Create opportunity from client
export const createOpportunityFromClient = async (
  clientId: number,
  data: Omit<OpportunitySchema, "client_id">
): Promise<OpportunityResource> => {
  const response = await api.post(
    `/ap/commercial/businessPartners/${clientId}/opportunities`,
    data
  );
  return response.data.data;
};

// Update opportunity
export const updateOpportunity = async (
  id: number,
  data: Partial<OpportunitySchema>
): Promise<OpportunityResource> => {
  const response = await api.put(`${ENDPOINT}/${id}`, data);
  return response.data.data;
};

export const closeOpportunity = async (
  id: number,
  comment: string
): Promise<OpportunityResource> => {
  const response = await api.put(`${ENDPOINT}/${id}/close`, { comment });
  return response.data.data;
};

// Delete opportunity
export const deleteOpportunity = async (id: number): Promise<void> => {
  await api.delete(`${ENDPOINT}/${id}`);
};

// ==================== OPPORTUNITY ACTIONS ====================

// Get all opportunity actions
export const getOpportunityActionsList = async (
  params?: Record<string, any>
): Promise<OpportunityActionResource[]> => {
  const response = await api.get(ACTIONS_ENDPOINT, { params });
  return response.data.data;
};

// Get opportunity action by ID
export const getOpportunityAction = async (
  id: number
): Promise<OpportunityActionResource> => {
  const response = await api.get(`${ACTIONS_ENDPOINT}/${id}`);
  return response.data.data;
};

// Create opportunity action
export const createOpportunityAction = async (
  data: OpportunityActionSchema
): Promise<OpportunityActionResource> => {
  const response = await api.post(ACTIONS_ENDPOINT, data);
  return response.data.data;
};

// Update opportunity action
export const updateOpportunityAction = async (
  id: number,
  data: Partial<OpportunityActionSchema>
): Promise<OpportunityActionResource> => {
  const response = await api.put(`${ACTIONS_ENDPOINT}/${id}`, data);
  return response.data.data;
};

// Delete opportunity action
export const deleteOpportunityAction = async (id: number): Promise<void> => {
  await api.delete(`${ACTIONS_ENDPOINT}/${id}`);
};

// ==================== COMMERCIAL MASTERS ====================

// Get commercial masters by type
export const getCommercialMasters = async ({
  params,
}: ParamsProps): Promise<CommercialMastersResponse> => {
  const response = await api.get(COMMERCIAL_MASTERS_ENDPOINT, {
    params,
  });
  return response.data;
};

// Get families
export const getFamilies = async (): Promise<any[]> => {
  const response = await api.get("/ap/configuration/families");
  return response.data.data;
};
