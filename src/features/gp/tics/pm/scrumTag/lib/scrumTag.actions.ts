import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { ScrumTagRequest, ScrumTagResource } from "./scrumTag.interface";
import { SCRUM_TAG } from "./scrumTag.constants";

const { ENDPOINT } = SCRUM_TAG;

export async function getScrumTags(
  projectId?: number
): Promise<ScrumTagResource[]> {
  const { data } = await api.get<ScrumTagResource[]>(ENDPOINT, {
    params: projectId !== undefined ? { project_id: projectId } : undefined,
  });
  return data;
}

export async function storeScrumTag(
  payload: ScrumTagRequest
): Promise<ScrumTagResource> {
  const { data } = await api.post<ScrumTagResource>(ENDPOINT, payload);
  return data;
}

export async function updateScrumTag(
  id: number,
  payload: Partial<ScrumTagRequest>
): Promise<ScrumTagResource> {
  const { data } = await api.put<ScrumTagResource>(`${ENDPOINT}/${id}`, payload);
  return data;
}

export async function deleteScrumTag(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
