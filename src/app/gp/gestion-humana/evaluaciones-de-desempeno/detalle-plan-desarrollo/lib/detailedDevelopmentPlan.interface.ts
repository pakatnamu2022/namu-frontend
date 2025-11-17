import { Links, Meta } from "@/shared/lib/pagination.interface";

export interface DetailedDevelopmentPlanResponse {
  data: DetailedDevelopmentPlanResource[];
  links: Links;
  meta: Meta;
}

export interface DetailedDevelopmentPlanResource {
  id: number;
  description: string;
  boss_confirms: boolean;
  worker_confirms: boolean;
  boss_confirms_completion: boolean;
  worker_confirms_completion: boolean;
  worker_id: number;
  worker_name: string | null;
  boss_id: number;
  boss_name: string | null;
  gh_evaluation_id: number;
  evaluation_name: string | null;
}

export interface StoreDetailedDevelopmentPlanRequest {
  description: string;
  boss_confirms?: boolean;
  worker_confirms?: boolean;
  boss_confirms_completion?: boolean;
  worker_confirms_completion?: boolean;
  worker_id: number;
  boss_id: number;
  gh_evaluation_id: number;
}

export interface UpdateDetailedDevelopmentPlanRequest {
  description?: string;
  boss_confirms?: boolean;
  worker_confirms?: boolean;
  boss_confirms_completion?: boolean;
  worker_confirms_completion?: boolean;
  worker_id?: number;
  boss_id?: number;
  gh_evaluation_id?: number;
}

export interface GetDetailedDevelopmentPlansProps {
  params?: Record<string, any>;
}
