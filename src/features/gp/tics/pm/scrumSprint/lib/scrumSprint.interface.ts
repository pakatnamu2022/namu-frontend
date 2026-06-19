export interface ScrumSprintProjectSummary {
  id: number;
  name: string;
  color?: string;
}

export interface ScrumSprintResource {
  id: number;
  project_id: number;
  name: string;
  goal?: string;
  start_date?: string;
  end_date?: string;
  status: "planeado" | "activo" | "cerrado";
  items_count: number;
  done_count: number;
  project?: ScrumSprintProjectSummary;
  completion_percentage?: number;
}

export interface ScrumSprintRequest {
  project_id: number;
  name: string;
  goal?: string;
  start_date?: string;
  end_date?: string;
  status?: "planeado" | "activo" | "cerrado";
}
