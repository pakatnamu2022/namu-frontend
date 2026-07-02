import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface EvaluationResponse {
  data: EvaluationResource[];
  links: Links;
  meta: Meta;
}

export interface EvaluationResource {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  typeEvaluation: number;
  typeEvaluationName: string;
  objectivesPercentage: string;
  competencesPercentage: string;
  cycle_id: number;
  period_id: number;
  competence_parameter_id: number;
  objective_parameter_id: number;
  final_parameter_id: number;
  statusName: string;
  status: number;
  period: string;
  cycle: string;
  competenceParameter: string;
  objectiveParameter: string;
  finalParameter: string;
  progress_stats?: ProgressStats;
  results_stats?: ResultsStats;
  send_open_notifications: boolean;
  send_close_notifications: boolean;
  send_opened_email: boolean;
  send_closed_email: boolean;
}

export interface ProgressStats {
  total_participants: number;
  completed_participants: number;
  in_progress_participants: number;
  not_started_participants: number;
  completion_percentage: number;
  progress_percentage: number;
}

export interface ResultsStats {
  ranges: ResultsStatsRange[];
  parameter_name: string;
  total_evaluated: number;
}

export interface ResultsStatsRange {
  count: number;
  range_to: string;
  percentage: number;
  range_from: string;
  range_index: number;
  range_label: string;
}

export interface getEvaluationsProps {
  params?: Record<string, any>;
}

export interface EvaluationEligibleWorkerResource {
  person_id: number;
  name: string;
  dni: string;
  fecha_inicio: string;
  position: string;
  area: string;
  sede: string;
  hierarchical_category: string;
  hierarchical_category_id: number;
  evaluator: string;
  evaluator_position: string;
  will_have: {
    objectives?: number;
    competences?: number;
  };
}

export interface AddWorkersToEvaluationResponse {
  persons_added: number;
  persons_skipped: number;
  errors: string[];
  added_details: {
    id: number;
    name: string;
    dni: string;
    position: string;
    area: string;
    hierarchical_category: string;
    fecha_inicio: string;
    reason: string;
  }[];
}
