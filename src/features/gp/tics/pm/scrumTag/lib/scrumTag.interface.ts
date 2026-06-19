export interface ScrumTagResource {
  id: number;
  name: string;
  color?: string;
  project_id?: number;
}

export interface ScrumTagRequest {
  name: string;
  color?: string;
  project_id?: number;
}
