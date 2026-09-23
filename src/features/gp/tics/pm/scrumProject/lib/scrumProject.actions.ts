import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import {
  ScrumProjectGantt,
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

export async function getScrumProjectGantt(id: number): Promise<ScrumProjectGantt> {
  const { data } = await api.get<ScrumProjectGantt>(`${ENDPOINT}/${id}/gantt`);
  return data;
}

export async function downloadScrumProjectGanttPdf(
  id: number,
  projectName: string
): Promise<void> {
  const response = await api.get(`${ENDPOINT}/${id}/gantt/pdf`, {
    responseType: "blob",
  });

  const blob = new Blob([response.data], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const slug = projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  link.setAttribute("download", `gantt-${slug || id}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
}
