import { Links, Meta } from "@/src/shared/lib/pagination.interface";

export interface CyclePersonDetailResponse {
  data: CyclePersonDetailResource[];
  links: Links;
  meta: Meta;
}

export interface CyclePersonDetailResource {
  id: number;
  person: string;
  chief: string;
  position: string;
  sede: string;
  area: string;
  category: string;
  objective: string;
  objective_description?: string;
  isAscending: boolean;
  goal: string;
  weight: string;
  status: string;
  metric: string;
  end_date_objectives: string;
}
