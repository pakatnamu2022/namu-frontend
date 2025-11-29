export interface DailyDeliverySummaryItem {
  entregas: number;
  facturacion: number;
  reporteria_dealer_portal: number | null;
}

export interface DailyDeliverySummary {
  TOTAL_AP_LIVIANOS: DailyDeliverySummaryItem;
  TOTAL_AP_CAMIONES: DailyDeliverySummaryItem;
  TOTAL_AP: DailyDeliverySummaryItem;
}

export interface DailyDeliveryHierarchyNode {
  id: number;
  name: string;
  level: "gerente" | "asesor";
  entregas: number;
  facturacion: number;
  reporteria_dealer_portal: number | null;
  children: DailyDeliveryHierarchyNode[];
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
