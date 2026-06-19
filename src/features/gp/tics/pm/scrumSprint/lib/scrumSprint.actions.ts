import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import {
  ScrumSprintRequest,
  ScrumSprintResource,
} from "./scrumSprint.interface";
import { SCRUM_SPRINT } from "./scrumSprint.constants";

const { ENDPOINT } = SCRUM_SPRINT;

export async function getScrumSprints(
  projectId?: number | null,
  params?: Record<string, any>
): Promise<ScrumSprintResource[]> {
  const { data } = await api.get<ScrumSprintResource[] | { data: ScrumSprintResource[] }>(ENDPOINT, {
    params: { ...(projectId != null ? { project_id: projectId } : {}), ...params },
  });
  return Array.isArray(data) ? data : (data as { data: ScrumSprintResource[] }).data ?? [];
}

export async function findScrumSprintById(
  id: number
): Promise<ScrumSprintResource> {
  const { data } = await api.get<ScrumSprintResource>(`${ENDPOINT}/${id}`);
  return data;
}

export async function storeScrumSprint(
  payload: ScrumSprintRequest
): Promise<ScrumSprintResource> {
  const { data } = await api.post<ScrumSprintResource>(ENDPOINT, payload);
  return data;
}

export async function updateScrumSprint(
  id: number,
  payload: Partial<ScrumSprintRequest>
): Promise<ScrumSprintResource> {
  const { data } = await api.put<ScrumSprintResource>(
    `${ENDPOINT}/${id}`,
    payload
  );
  return data;
}

export async function activateScrumSprint(
  id: number
): Promise<ScrumSprintResource> {
  const { data } = await api.post<ScrumSprintResource>(
    `${ENDPOINT}/${id}/activate`
  );
  return data;
}

export async function closeScrumSprint(
  id: number
): Promise<ScrumSprintResource> {
  const { data } = await api.post<ScrumSprintResource>(
    `${ENDPOINT}/${id}/close`
  );
  return data;
}

export async function deleteScrumSprint(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
