import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface AssignmentLeadershipResponse {
  data: AssignmentLeadershipResource[];
  links: Links;
  meta: Meta;
}

export interface AssignmentLeadershipResource {
  boss_id: number;
  year: number;
  month: number;
  assigned_workers: AsesorResource[];
  status: boolean;
  hierarchy: boolean;
}

export interface AssignmentLeadershipRequest {
  boss_id: number;
  assigned_workers: AsesorResource[];
  hierarchy: boolean;
}

export interface AsesorResource {
  id: number;
  name: string;
}

export interface getAssignmentLeadershipProps {
  params?: Record<string, any>;
}
