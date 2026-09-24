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

export interface ScrumProjectGanttItem {
  id: number;
  parent_id?: number | null;
  parent_title?: string | null;
  parent_in_same_sprint?: boolean | null;
  title: string;
  type: string;
  status: string;
  priority?: string;
  assignee?: string | null;
  start_at: string;
  end_at: string;
  progress: number;
}

export interface ScrumProjectGanttSprint {
  id: number;
  name: string;
  kind: "dev" | "test";
  start_date: string | null;
  end_date: string | null;
  status: "planeado" | "activo" | "cerrado";
  items: ScrumProjectGanttItem[];
}

export interface ScrumProjectGantt {
  project: { id: number; name: string; color?: string; status: string };
  range: { start: string | null; end: string | null };
  sprints: ScrumProjectGanttSprint[];
  backlog: ScrumProjectGanttItem[];
  generated_at: string;
}
