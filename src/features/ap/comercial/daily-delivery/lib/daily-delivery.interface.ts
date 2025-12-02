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

export interface DailyDeliveryResponse {
  date: string;
  period: {
    year: number;
    month: number;
  };
  summary: DailyDeliverySummary;
  advisors: any[];
  hierarchy: DailyDeliveryHierarchyNode[];
}
