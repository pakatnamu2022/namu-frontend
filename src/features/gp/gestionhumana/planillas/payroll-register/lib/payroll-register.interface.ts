import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface PayrollRegisterResponse {
  data: PayrollRegisterResource[];
  links: Links;
  meta: Meta;
}

export interface PayrollRegisterResource {
  id: number;
  period_id: number;
  worker_id: number;
  worker_name: string | null;
  worker_vat: string | null;
  // Período
  cost_center: string | null;
  status: string | null;
  occupation: string | null;
  monthly_salary: number;
  afp_affiliation: string | null;
  has_family_allowance: boolean;
  has_essalud_vida: boolean;
  // Días
  days_worked: number;
  days_vacation: number;
  days_medical_rest: number;
  days_absence: number;
  days_leave_unpaid: number;
  days_leave_paid: number;
  days_subsidy: number;
  days_not_worked: number;
  days_effective: number;
  normal_hours: number;
  has_vacation: boolean;
  has_subsidy: boolean;
  calc_days_worked: number;
  calc_days_not_worked: number;
  // Ingresos
  basic_salary: number;
  family_allowance: number;
  overtime_25: number;
  overtime_35: number;
  subsidy_disability: number;
  work_conditions: number;
  vacation_pay: number;
  production_bonus: number;
  holiday_days_pay: number;
  worked_rest_days_pay: number;
  night_bonus: number;
  commercial_bonus: number;
  schooling_allowance: number;
  food_benefit: number;
  total_income: number;
  // BB.SS truncos
  cts_truncated: number;
  gratification: number;
  extraordinary_bonus: number;
  vacation_truncated: number;
  // Descuentos
  onp_deduction: number;
  bonus_referral: number;
  afp_mandatory: number;
  afp_insurance: number;
  afp_commission: number;
  afp_total: number;
  income_tax_5th: number;
  oncosalud_plan: number;
  advances_loans: number;
  other_deductions: number;
  judicial_deductions: number;
  grace_amount: number;
  total_deductions: number;
  // Netos
  net_pay_preliminary: number;
  christmas_gratification: number;
  christmas_extraordinary_bonus: number;
  aguinaldo: number;
  net_pay_plus_aguinaldo: number;
  // Aportes empleador
  cts_employer: number;
  essalud_employer: number;
  sctr_total: number;
  life_insurance: number;
  sctr_health: number;
  sctr_pension: number;
  employer_contributions_total: number;
  // Netos finales
  vacation_paid_preliminary: number;
  net_pay_final: number;
  worker_deduction_total: number;
  period?: any;
}
