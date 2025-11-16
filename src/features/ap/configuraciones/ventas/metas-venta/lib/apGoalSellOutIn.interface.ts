import { Links, Meta } from "@/src/shared/lib/pagination.interface";

export interface ApGoalSellOutInResponse {
  data: ApGoalSellOutInResource[];
  links: Links;
  meta: Meta;
}

export interface ApGoalSellOutInResource {
  id: number;
  year: number;
  month: number;
  goal: number;
  brand_id: number;
  shop_id: number;
  type: string;
}

export interface ApGoalSellOutInRequest {}

export interface getApGoalSellOutInProps {
  params?: Record<string, any>;
}

// PARA EL REPORTE
export interface ReportRow {
  shop: string;
  total: number;
  [brandName: string]: string | number;
}

export interface ReportSection {
  rows: ReportRow[];
  totals: ReportRow;
}

export interface ApGoalSellOutInReportData {
  brands: string[];
  sell_in: ReportSection;
  sell_out: ReportSection;
}

export interface ApGoalSellOutInReportResponse {
  data: ApGoalSellOutInReportData;
  period: {
    year: string;
    month: string;
    month_name: string;
  };
}
