import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface GoalTravelControlResponse {
  data: GoalTravelControlResource[];
  available_years?: number[];
  links: Links;
  meta: Meta;
}

export interface GoalTravelControlResource {
  id: number;
  date: Date;
  year?: number;
  month?: number;
  total: number;
  driver_goal: number;
  vehicle_goal: number;
  total_units: number;
  status_deleted: number;
}

export interface GoalTravelSearchFilters {
  search?: string;
  year?: string;
  month?: string;
  status_id?: string;
}

export interface getGoalTravelControlProps {
  params?: Record<string, any>;
}

export interface GoalTravelQueryParams extends GoalTravelSearchFilters {
  page?: number;
  per_page?: number;
}
