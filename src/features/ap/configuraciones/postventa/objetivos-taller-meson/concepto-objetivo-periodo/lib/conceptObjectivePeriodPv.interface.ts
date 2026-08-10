import { ConceptObjectivePvArea } from "../../lib/conceptObjectiveMasterPv.interface.ts";
import { ObjectiveSedePeriodPvResource } from "../../objetivo-sede-periodo/lib/objectiveSedePeriodPv.interface.ts";

export interface ConceptObjectiveAdvisorWorker {
  id: number;
  name: string;
}

export interface ConceptObjectiveAdvisorResource {
  id: number;
  worker_id: number;
  worker: ConceptObjectiveAdvisorWorker | null;
  amount: string;
  concept_objective_period_pv_id: number;
  created_at: string;
  updated_at: string;
}

export interface ConceptObjectiveAdvisorRequest {
  id?: number;
  worker_id: number;
  amount: number;
}

export interface ConceptObjectivePeriodPvResource {
  id: number;
  objective_sede_period_pv_id: number;
  objective_sede_period: ObjectiveSedePeriodPvResource | null;
  area_id: number;
  area: ConceptObjectivePvArea | null;
  description: string;
  is_vehicular_crossing: boolean;
  status: boolean;
  sub_amount: string;
  order: number;
  type_planning_ids: number[];
  advisors: ConceptObjectiveAdvisorResource[];
  created_at: string;
  updated_at: string;
}

export interface ConceptObjectivePeriodPvRequest {
  objective_sede_period_pv_id: number;
  area_id: number;
  description: string;
  is_vehicular_crossing?: boolean;
  status?: boolean;
  sub_amount: number;
  order: number;
  type_planning_ids?: number[];
  advisors?: ConceptObjectiveAdvisorRequest[];
}

export interface getConceptObjectivePeriodPvProps {
  params?: Record<string, any>;
}
