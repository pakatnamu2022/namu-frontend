import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export type ScrumItemType = "tarea" | "historia" | "funcion" | "solicitud" | "error";
export type ScrumItemStatus = "backlog" | "por_hacer" | "en_progreso" | "en_revision" | "hecho";
export type ScrumItemPriority = "alta" | "media" | "baja";

export interface ScrumItemAssignee {
  id: number;
  name: string;
}

export interface ScrumItemTag {
  id: number;
  name: string;
  color?: string;
}

export interface ScrumItemChild {
  id: number;
  parent_id: number;
  title: string;
  status: ScrumItemStatus;
  order: number;
}

export interface ScrumKanbanItem {
  id: number;
  title: string;
  type: ScrumItemType;
  status: ScrumItemStatus;
  priority?: ScrumItemPriority;
  order: number;
  story_points?: number;
  assignee?: ScrumItemAssignee;
  tags: ScrumItemTag[];
  children: ScrumItemChild[];
}

export interface ScrumKanbanResponse {
  backlog: ScrumKanbanItem[];
  por_hacer: ScrumKanbanItem[];
  en_progreso: ScrumKanbanItem[];
  en_revision: ScrumKanbanItem[];
  hecho: ScrumKanbanItem[];
}

export interface ScrumItemResource {
  id: number;
  title: string;
  type: ScrumItemType;
  status: ScrumItemStatus;
  priority?: ScrumItemPriority;
  order: number;
  story_points?: number;
  project_id: number;
  sprint_id?: number;
  parent_id?: number;
  assigned_to?: number;
  assignee?: ScrumItemAssignee;
  creator?: ScrumItemAssignee;
  tags: ScrumItemTag[];
  children_count?: number;
  due_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  closed_at?: string;
}

export interface ScrumItemResponse {
  data: ScrumItemResource[];
  links: Links;
  meta: Meta;
}

export interface ScrumItemComment {
  id: number;
  content: string;
  created_at: string;
  user: ScrumItemAssignee;
}

export interface ScrumItemHistoryEntry {
  field: string;
  old_value?: string;
  new_value?: string;
  created_at: string;
  user: ScrumItemAssignee;
}

export interface ScrumItemProjectSummary {
  id: number;
  name: string;
  color?: string;
}

export interface ScrumItemSprintSummary {
  id: number;
  name: string;
  status: "planeado" | "activo" | "cerrado";
}

export interface ScrumItemParentSummary {
  id: number;
  title: string;
}

export interface ScrumItemDetail extends ScrumItemResource {
  description?: string;
  project: ScrumItemProjectSummary;
  sprint?: ScrumItemSprintSummary;
  parent?: ScrumItemParentSummary;
  children: ScrumItemResource[];
  watchers: ScrumItemAssignee[];
  comments: ScrumItemComment[];
  history: ScrumItemHistoryEntry[];
}

export interface ScrumItemRequest {
  project_id: number;
  sprint_id?: number | null;
  parent_id?: number | null;
  type: ScrumItemType;
  title: string;
  description?: string;
  status?: ScrumItemStatus;
  priority?: ScrumItemPriority;
  assigned_to?: number | null;
  story_points?: number | null;
  estimated_hours?: number | null;
  actual_hours?: number | null;
  due_date?: string | null;
  tag_ids?: number[];
}

export interface ScrumItemReorderRequest {
  project_id: number;
  sprint_id?: number | null;
  items: number[];
}
