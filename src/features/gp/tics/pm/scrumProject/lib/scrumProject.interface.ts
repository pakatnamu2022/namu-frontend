import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface ScrumProjectResponse {
  data: ScrumProjectResource[];
  links: Links;
  meta: Meta;
  current_page: number;
  total: number;
}

export interface ScrumProjectCreator {
  id: number;
  name: string;
}

export interface ScrumProjectActiveSprint {
  id: number;
  name: string;
  status: "planeado" | "activo" | "cerrado";
}

export interface ScrumProjectSprintSummary {
  id: number;
  name: string;
  status: "planeado" | "activo" | "cerrado";
}

export interface ScrumProjectTagSummary {
  id: number;
  name: string;
  color?: string;
  project_id?: number;
}

export interface ScrumProjectResource {
  id: number;
  name: string;
  description?: string;
  color?: string;
  status: "activo" | "archivado";
  created_by: number;
  creator: ScrumProjectCreator;
  active_sprint?: ScrumProjectActiveSprint;
  sprints_count: number;
  items_count: number;
  sprints?: ScrumProjectSprintSummary[];
  tags?: ScrumProjectTagSummary[];
}

export interface ScrumProjectRequest {
  name: string;
  description?: string;
  color?: string;
  status?: "activo" | "archivado";
}
