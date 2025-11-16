import { Links, Meta } from "@/src/shared/lib/pagination.interface";

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
}

export interface AssignmentLeadershipRequest {
  boss_id: number;
  assigned_workers: AsesorResource[];
}

export interface AsesorResource {
  id: number;
  name: string;
}

export interface getAssignmentLeadershipProps {
  params?: Record<string, any>;
}
