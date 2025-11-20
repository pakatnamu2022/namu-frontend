import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface DevelopmentPlanResponse {
  data: DevelopmentPlanResource[];
  links: Links;
  meta: Meta;
}

export interface DevelopmentPlanTaskResource {
  id: number;
  description: string;
  end_date: string;
  fulfilled: boolean;
}

export interface DevelopmentPlanResource {
  id: number;
  title: string | null;
  description: string;
  start_date: string | null;
  end_date: string | null;
  worker_id: number;
  boss_id: number | null;
  comment: string | null;
  rrhh_confirms: boolean | null;
  visible_rrhh: boolean | null;
  gh_evaluation_id: number | null;
  created_at: string;
  updated_at: string;
  tasks: DevelopmentPlanTaskResource[];
  worker?: {
    id: number;
    name: string;
    position?: string;
  };
  boss?: {
    id: number;
    name: string;
  };
}

export interface DevelopmentPlanRequest {
  title: string | null;
  description: string;
  start_date: string | null;
  end_date: string | null;
  worker_id: number;
  boss_id: number | null;
  comment?: string | null;
  rrhh_confirms?: boolean | null;
  visible_rrhh?: boolean | null;
  gh_evaluation_id?: number | null;
  tasks: {
    description: string;
    end_date: string;
    fulfilled: boolean;
  }[];
}

export interface DevelopmentPlanTaskRequest {
  description: string;
  end_date: string;
  fulfilled: boolean;
}
