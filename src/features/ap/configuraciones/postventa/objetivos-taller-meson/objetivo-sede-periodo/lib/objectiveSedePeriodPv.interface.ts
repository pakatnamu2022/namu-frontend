import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";
import { SedeResource } from "@/features/gp/maestro-general/sede/lib/sede.interface.ts";

export interface ObjectiveSedePeriodPvResponse {
  data: ObjectiveSedePeriodPvResource[];
  links: Links;
  meta: Meta;
}

export interface ObjectiveSedePeriodPvConceptSummary {
  id: number;
  area_id: number;
  area: { id: number; code: string | null; description: string } | null;
  description: string;
  is_vehicular_crossing: boolean;
  status: boolean;
  sub_amount: string;
  order: number;
  type_planning_ids: number[];
  advisors: {
    id: number;
    worker_id: number;
    worker_name: string;
    amount: string;
  }[];
}

export interface ObjectiveSedePeriodPvResource {
  id: number;
  sede_id: number;
  sede: SedeResource | null;
  year: number;
  month: number;
  amount: string;
  concept_objectives?: ObjectiveSedePeriodPvConceptSummary[];
  created_at: string;
  updated_at: string;
}

export interface ObjectiveSedePeriodPvRequest {
  sede_id: number;
  year: number;
  month: number;
  amount: number;
}

export interface getObjectiveSedePeriodPvProps {
  params?: Record<string, any>;
}
