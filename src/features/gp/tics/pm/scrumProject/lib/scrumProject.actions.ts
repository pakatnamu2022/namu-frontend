import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import {
  ScrumProjectRequest,
  ScrumProjectResource,
  ScrumProjectResponse,
} from "./scrumProject.interface";
import { SCRUM_PROJECT } from "./scrumProject.constants";

const { ENDPOINT } = SCRUM_PROJECT;

export async function getScrumProjects(
  params?: Record<string, any>
): Promise<ScrumProjectResponse> {
  const { data } = await api.get<ScrumProjectResponse>(ENDPOINT, { params });
  return data;
}

export async function findScrumProjectById(
  id: number
): Promise<ScrumProjectResource> {
  const { data } = await api.get<ScrumProjectResource>(`${ENDPOINT}/${id}`);
  return data;
}

export async function storeScrumProject(
  payload: ScrumProjectRequest
): Promise<ScrumProjectResource> {
  const { data } = await api.post<ScrumProjectResource>(ENDPOINT, payload);
  return data;
}

export async function updateScrumProject(
  id: number,
  payload: Partial<ScrumProjectRequest>
): Promise<ScrumProjectResource> {
  const { data } = await api.put<ScrumProjectResource>(
    `${ENDPOINT}/${id}`,
    payload
  );
  return data;
}

export async function deleteScrumProject(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
