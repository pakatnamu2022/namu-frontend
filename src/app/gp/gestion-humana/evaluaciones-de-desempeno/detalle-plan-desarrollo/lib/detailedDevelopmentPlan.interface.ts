import { Links, Meta } from "@/shared/lib/pagination.interface";

export interface DetailedDevelopmentPlanResponse {
  data: DetailedDevelopmentPlanResource[];
  links: Links;
  meta: Meta;
}

export interface DetailedDevelopmentPlanTaskResource {
  id: number;
  description: string;
  end_date: string;
  fulfilled: boolean;
}

export interface DetailedDevelopmentPlanResource {
  id: number;
  description: string;
  comment: string | null;
  worker_id: number;
  worker_name: string | null;
  boss_id: number;
  boss_name: string | null;
  gh_evaluation_id: number;
  evaluation_name: string | null;
  title: string | null;
  start_date: string | null;
  end_date: string | null;
  tasks: DetailedDevelopmentPlanTaskResource[];
}

export interface StoreDetailedDevelopmentPlanRequest {
  description: string;
  comment?: string | null;
  worker_id: number;
  boss_id: number;
  gh_evaluation_id: number;
}

export interface UpdateDetailedDevelopmentPlanRequest {
  description?: string;
  comment?: string | null;
  worker_id?: number;
  boss_id?: number;
  gh_evaluation_id?: number;
}

export interface GetDetailedDevelopmentPlansProps {
  params?: Record<string, any>;
}
