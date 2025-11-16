import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface ObjectiveResponse {
  data: ObjectiveResource[];
  links: Links;
  meta: Meta;
}

export interface ObjectiveResource {
  id: number;
  name: string;
  description?: string;
  goalReference: string;
  fixedWeight: number;
  isAscending: boolean;
  metric: string;
  metric_id: number;
}

export interface getObjectivesProps {
  params?: Record<string, any>;
}
