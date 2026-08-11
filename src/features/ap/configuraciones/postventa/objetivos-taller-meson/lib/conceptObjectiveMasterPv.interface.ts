export interface ConceptObjectivePvArea {
  id: number;
  code: string;
  description: string;
}

export interface ConceptObjectivePvResource {
  id: number;
  area_id: number;
  area: ConceptObjectivePvArea | null;
  description: string;
  is_vehicular_crossing: boolean;
  status: boolean;
  type_planning_ids: number[];
  order: number;
  created_at: string;
  updated_at: string;
}

export interface ConceptObjectivePvRequest {
  id?: number;
  area_id: number;
  description: string;
  is_vehicular_crossing?: boolean;
  status?: boolean;
  type_planning_ids?: number[];
  order?: number;
}

export interface getConceptObjectivePvProps {
  params?: Record<string, any>;
}
