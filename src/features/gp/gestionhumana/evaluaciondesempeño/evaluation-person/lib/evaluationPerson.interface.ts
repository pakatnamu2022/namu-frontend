import { type Links, type Meta } from "@/shared/lib/pagination.interface";
import { type CyclePersonDetailResource } from "../../ciclos/lib/cyclePersonDetail";
import { type EvaluationResource } from "../../evaluaciones/lib/evaluation.interface";
import { type WorkerResource } from "../../../personal/trabajadores/lib/worker.interface";
import { type ParameterResource } from "../../parametros/lib/parameter.interface";

export interface EvaluationPersonResponse {
  data: EvaluationPersonResultResource[];
  links: Links;
  meta: Meta;
}

export interface EvaluationPersonResultResource {
  id: number;
  person_id: number;
  evaluation_id: number;
  person: WorkerResource;
  competencesPercentage: number;
  objectivesPercentage: number;
  objectivesResult: number;
  competencesResult: number;
  result: number;
  evaluation: EvaluationResource;
  details: EvaluationPersonResource[];
  competenceGroups: CompetenceGroup[];
  statistics: Statistics;
  maxCompetenceParameter: number;
  maxFinalParameter: number;
  maxObjectiveParameter: number;
  finalParameter: ParameterResource;
  objectiveParameter: ParameterResource;
  competenceParameter: ParameterResource;
  hasObjectives: boolean;
  total_progress: TotalProgress;
}

export interface TotalProgress {
  completion_rate: number;
  completed_sections: number;
  total_sections: number;
  is_completed: boolean;
  objectives_progress: Objectivesprogress;
  competences_progress: Competencesprogress;
}

export interface Competencesprogress {
  completion_rate: number;
  completed: number;
  total: number;
  is_completed: boolean;
  groups: number;
}

export interface Objectivesprogress {
  completion_rate: number;
  completed: number;
  total: number;
  is_completed: boolean;
  has_objectives: boolean;
}

export interface EvaluationPersonResultByPersonAndEvaluationResponse {
  data: EvaluationPersonResultResource;
}

export interface EvaluationPersonResource {
  id: number;
  person: string;
  personCycleDetail: CyclePersonDetailResource;
  evaluation: string;
  result: string;
  compliance: number;
  qualification: number;
  comment?: string;
  wasEvaluated: boolean;
  index_range_result: number;
  label_range: string;
}

export interface getEvaluationPersonProps {
  params?: Record<string, any>;
}

export interface Statistics {
  overall_completion_rate: number;
  competences: Competences;
  objectives: Competences;
  final: Final;
  evaluator_averages: any[];
  competence_analysis: Competenceanalysis;
  evaluation_status: Evaluationstatus;
}

export interface Evaluationstatus {
  current_status: number;
  status_name: null;
  is_active: boolean;
  days_remaining: number;
  is_overdue: boolean;
  progress_percentage: number;
}

export interface Competenceanalysis {
  strengths: Strength[];
  opportunities: Strength[];
}

export interface Strength {
  competence_name: string;
  average_result: number;
  completion_rate: number;
}

export interface Competences {
  completion_rate: number;
  completed: number;
  total: number;
  average_score: number;
  max_score: number;
  index_range_result: number;
  label_range: string;
}

export interface Final {
  index_range_result: number;
  max_score: number;
  label_range: string;
}

export interface CompetenceGroup {
  competence_id: number;
  competence_name: string;
  competence_description: string;
  sub_competences: Subcompetence[];
  average_result: number;
  total_sub_competences: number;
  completed_evaluations: number;
  evaluation_type: number;
  evaluation_type_name: null;
  required_evaluator_types: number[];
}

export interface Subcompetence {
  sub_competence_id: number;
  sub_competence_name: string;
  sub_competence_description: string;
  evaluators: Evaluator[];
  average_result: number;
  completion_percentage: number;
  is_completed: boolean;
}

export interface Evaluator {
  evaluator_type: number;
  evaluator_type_name: string;
  evaluator_id: number;
  evaluator_name: string;
  result: string;
  id: number;
  is_completed: boolean;
}
