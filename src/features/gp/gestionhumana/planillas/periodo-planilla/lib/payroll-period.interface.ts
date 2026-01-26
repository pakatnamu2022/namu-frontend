import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface PayrollPeriodResponse {
  data: PayrollPeriodResource[];
  links: Links;
  meta: Meta;
}

export interface PayrollPeriodResource {
  id: number;
  code: string;
  name: string;
  year: number;
  month: number;
  start_date: string;
  end_date: string;
  payment_date: string;
  status: PayrollPeriodStatus;
  can_modify: boolean;
  can_calculate: boolean;
  company: Company | null;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: number;
  name: string;
}

export type PayrollPeriodStatus = "OPEN" | "CALCULATED" | "CLOSED";

export interface getPayrollPeriodsProps {
  params?: Record<string, any>;
}
