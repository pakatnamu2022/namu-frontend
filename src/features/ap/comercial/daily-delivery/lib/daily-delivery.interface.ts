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

export interface AvancePorSedeBrand {
  brand_id: number;
  brand_name: string;
  level: "brand";
  objetivo_ap_entregas: number;
  resultado_entrega: number;
  cumplimiento_entrega: number;
  objetivos_reporte_inchcape: number;
  reporte_dealer_portal: number | null;
  cumplimiento_reporte: number | null;
  objetivos_compra_inchcape: number;
  avance_compra: number;
  cumplimiento_compra: number;
}

export interface AvancePorSede {
  sede_id: number;
  sede_name: string;
  level: "sede";
  brands: AvancePorSedeBrand[];
}

export interface DailyDeliveryResponse {
  fecha_inicio: string;
  fecha_fin: string;
  period: {
    year: number;
    month: number;
  };
  summary: DailyDeliverySummary;
  advisors: any[];
  hierarchy: DailyDeliveryHierarchyNode[];
  brand_report: BrandReportSection[];
  avance_por_sede: AvancePorSede[];
}
