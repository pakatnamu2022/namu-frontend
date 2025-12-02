export interface DailyDeliverySummaryItem {
  entregas: number;
  facturadas: number;
  reporteria_dealer_portal: number | null;
}

export interface DailyDeliverySummary {
  TOTAL: DailyDeliverySummaryItem;
}

export interface DailyDeliveryHierarchyNode {
  id: number;
  name: string;
  level: "gerente" | "jefe" | "asesor";
  brand_group?: string;
  article_class?: string;
  brands?: string[] | null;
  entregas: number;
  facturadas: number;
  reporteria_dealer_portal: number | null;
  children?: DailyDeliveryHierarchyNode[];
}

export interface BrandReportItem {
  name: string;
  level: "group" | "sede" | "brand";
  compras: number;
  entregas: number;
  facturadas: number;
  reporteria_dealer_portal: number | null;
}

export interface BrandReportSection {
  title: string;
  total_compras: number;
  total_entregas: number;
  total_facturadas: number;
  items: BrandReportItem[];
}

export interface DailyDeliveryResponse {
  date: string;
  period: {
    year: number;
    month: number;
  };
  summary: DailyDeliverySummary;
  advisors: any[];
  hierarchy: DailyDeliveryHierarchyNode[];
  brand_report: BrandReportSection[];
}
