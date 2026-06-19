import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import {
  ScrumItemDetail,
  ScrumItemRequest,
  ScrumItemReorderRequest,
  ScrumItemResource,
  ScrumItemResponse,
  ScrumKanbanResponse,
} from "./scrumItem.interface";
import { SCRUM_ITEM } from "./scrumItem.constants";

const { ENDPOINT } = SCRUM_ITEM;

export async function getScrumKanban(
  sprintId: number
): Promise<ScrumKanbanResponse> {
  const { data } = await api.get<ScrumKanbanResponse>(
    `${ENDPOINT}/kanban/${sprintId}`
  );
  return data;
}

export async function getScrumBacklog(
  projectId: number
): Promise<ScrumItemResource[]> {
  const { data } = await api.get<ScrumItemResource[]>(
    `${ENDPOINT}/backlog/${projectId}`
  );
  return data;
}

export async function getScrumItems(
  params?: Record<string, any>
): Promise<ScrumItemResponse> {
  const { data } = await api.get<ScrumItemResponse>(ENDPOINT, { params });
  return data;
}

export async function findScrumItemById(id: number): Promise<ScrumItemDetail> {
  const { data } = await api.get<ScrumItemDetail>(`${ENDPOINT}/${id}`);
  return data;
}

export async function storeScrumItem(
  payload: ScrumItemRequest
): Promise<ScrumItemResource> {
  const { data } = await api.post<ScrumItemResource>(ENDPOINT, payload);
  return data;
}

export async function updateScrumItem(
  id: number,
  payload: Partial<ScrumItemRequest>
): Promise<ScrumItemResource> {
  const { data } = await api.put<ScrumItemResource>(
    `${ENDPOINT}/${id}`,
    payload
  );
  return data;
}

export async function reorderScrumItems(
  payload: ScrumItemReorderRequest
): Promise<GeneralResponse> {
  const { data } = await api.post<GeneralResponse>(
    `${ENDPOINT}/reorder`,
    payload
  );
  return data;
}

export async function toggleWatchScrumItem(
  id: number
): Promise<{ watching: boolean }> {
  const { data } = await api.post<{ watching: boolean }>(
    `${ENDPOINT}/${id}/watch`
  );
  return data;
}

export async function deleteScrumItem(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}

export async function storeScrumComment(payload: {
  item_id: number;
  content: string;
}): Promise<GeneralResponse> {
  const { data } = await api.post<GeneralResponse>(
    `${ENDPOINT}/${payload.item_id}/comments`,
    { content: payload.content }
  );
  return data;
}

export async function deleteScrumComment(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/comments/${id}`);
  return data;
}
