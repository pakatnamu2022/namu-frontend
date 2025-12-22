import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";

export interface PerDiemRateResponse {
  data: PerDiemRateResource[];
  links: Links;
  meta: Meta;
}

export interface PerDiemRateResource {
  id: number;
  per_diem_policy_id: string;
  district_id: string;
  per_diem_category_id: string;
  expense_type_id: string;
  daily_amount: number;
  active: boolean;
}

export interface PerDiemRateRequest {
  per_diem_policy_id: string;
  district_id: string;
  per_diem_category_id: string;
  expense_type_id: string;
  daily_amount: number;
  active: boolean;
}

export interface getPerDiemRateProps {
  params?: Record<string, any>;
}
