export interface AdoptionFilters {
  date_from?: string;
  date_to?: string;
  sede_id?: number;
  user_id?: number;
  module?: string;
  expected_ops_per_day?: number;
}

// Summary
export interface AdoptionTrendPeriod {
  ops: number;
  active_users: number;
  days: number;
}

export interface AdoptionSummary {
  active_users: number;
  expected_users: number;
  total_ops: number;
  top_sede: string | null;
  global_adoption_index: number;
  trend_vs_previous_period: number | null;
  trend_7_days: AdoptionTrendPeriod;
  trend_30_days: AdoptionTrendPeriod;
}

// Users
export interface AdoptionUserBreakdown {
  frequency: number;
  persistence: number;
  compliance: number;
  quality: number;
}

export interface AdoptionUser {
  user_id: number;
  user_name: string;
  sede_id: number;
  sede_name: string;
  total_ops: number;
  creates: number;
  updates: number;
  deletes: number;
  action_score: number;
  active_days: number;
  unique_modules: number;
  modules_list: string[];
  adoption_score: number;
  score_breakdown: AdoptionUserBreakdown;
  badge: string | null;
}

// Sedes
export interface AdoptionSede {
  sede_id: number;
  sede_name: string;
  sede_code: string;
  total_ops: number;
  active_users: number;
  expected_users: number;
  ops_per_user: number;
  unique_models: number;
  adoption_index: number;
  compliance_semaphore: "green" | "yellow" | "red";
}

// Modules
export interface AdoptionModuleModel {
  model: string;
  total_ops: number;
  users: number;
}

export interface AdoptionModule {
  module: string;
  total_ops: number;
  users: number;
  active_days: number;
  creates: number;
  updates: number;
  deletes: number;
  models: AdoptionModuleModel[];
  share_pct: number;
}

// Compliance
export interface ComplianceUser {
  user_id: number;
  user_name: string;
  sede_name: string;
  actual_ops: number;
  expected_ops: number;
  compliance_pct: number;
  semaphore: "green" | "yellow" | "red";
}

export interface AdoptionComplianceSummary {
  green: number;
  yellow: number;
  red: number;
}

export interface AdoptionCompliance {
  active_compliance: ComplianceUser[];
  inactive_users: ComplianceUser[];
  summary: AdoptionComplianceSummary;
}

// Champions
export interface AdoptionChampion {
  user_id: number;
  user_name: string;
  sede_name: string;
  adoption_score: number;
  total_ops: number;
  active_days: number;
  unique_modules: number;
  badge?: string | null;
}

export interface AdoptionAtRiskUser {
  user_id: number;
  user_name: string;
  sede_name: string;
  adoption_score: number;
  total_ops: number;
  active_days: number;
  unique_modules: number;
  risk_level: "alto" | "medio" | "bajo";
}

export interface AdoptionChampions {
  champions: AdoptionChampion[];
  at_risk: AdoptionAtRiskUser[];
  champion_count: number;
  at_risk_count: number;
}

// Alerts
export interface AdoptionAlert {
  type: string;
  severity: "high" | "medium" | "low";
  message: string;
  entity: string;
  sede: string;
}

// Trend
export interface AdoptionTrendPoint {
  day: string;
  total_ops: number;
  active_users: number;
  creates: number;
  updates: number;
  deletes: number;
}
