export interface TeamDashboardResponse {
  evaluation: Evaluation;
  team_summary: TeamSummary;
  collaborators: Collaborator[];
  distribution: Distribution[];
  competence_gaps: CompetenceGap[];
  objectives_progress: any[];
  alerts: Alerts;
  area_metrics: AreaMetric[];
  category_metrics: CategoryMetric[];
}

export interface Evaluation {
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
  status: number;
  statusName: string;
  period: string;
  cycle: string;
  competenceParameter: string;
  objectiveParameter: string;
  finalParameter: string;
}

export interface TeamSummary {
  total_collaborators: number;
  completed: number;
  in_progress: number;
  not_started: number;
  completion_percentage: number;
  progress_percentage: number;
  average_result: number;
  average_objectives: number;
  average_competences: number;
}

export interface Collaborator {
  id: number;
  person_id: number;
  name: string;
  dni: string;
  position: string;
  area: string;
  sede: string;
  hierarchical_category: string;
  result: number;
  objectives_result: number;
  competences_result: number;
  completion_rate: number;
  is_completed: boolean;
  status: string;
  status_label: string;
  last_calculated_at: string;
}

export interface Distribution {
  label: string;
  from: string;
  to: string;
  count: number;
  percentage: number;
}

export interface CompetenceGap {
  competence_id: number;
  competence_name: string;
  average_score: number;
  max_score: string;
  gap_percentage: number;
  evaluations_count: number;
  status: string;
}

export interface Alerts {
  not_started_count: number;
  overdue_count: number;
  low_performance_count: number;
  evaluation_end_date: string;
  days_remaining: number;
  is_active: boolean;
}

export interface AreaMetric {
  area: string;
  total: number;
  average_result: number;
  completed: number;
}

export interface CategoryMetric {
  category: string;
  total: number;
  average_result: number;
  completed: number;
}
