export interface DailyDeliverySummaryItem {
  entregas: number;
  facturadas: number;
  reporteria_dealer_portal: number | null;
}

export interface DailyDeliverySummary {
  TOTAL: DailyDeliverySummaryItem;
  [category: string]: DailyDeliverySummaryItem;
}

export interface DailyDeliveryHierarchyNode {
  id: number | null;
  name: string;
  level: "gerente" | "jefe" | "asesor" | "grupo" | "sin_asesor";
  brand_group?: string;
  article_class?: string;
  brands?: string[] | null;
  entregas: number;
  facturadas: number;
  reporteria_dealer_portal: number | null;
  children?: DailyDeliveryHierarchyNode[];
}

export interface DeliveryDetailItem {
  delivery_id: number | null;
  vehicle_id: number | null;
  vin: string | null;
  placa: string | null;
  marca: string | null;
  modelo: string | null;
  sede: string | null;
  cliente: string | null;
  fecha_programada: string | null;
  fecha_real: string | null;
  estado: string | null;
}

export type DeliveriesDetail = Record<string, DeliveryDetailItem[]>;

export interface BrandReportItem {
  name: string;
  level: "group" | "sede" | "brand";
  compras: number;
  entregas: number;
  facturadas: number;
  stock_libre: number;
  reporteria_dealer_portal: number | null;
}

export interface BrandReportSection {
  title: string;
  total_compras: number;
  total_entregas: number;
  total_facturadas: number;
  total_libre: number;
  items: BrandReportItem[];
}

export interface CurrentInventoryItem {
  estado: string;
  estado_real: string;
  fecha_emision: string | null;
  importe_inicial: string | null;
  numero_factura: string | null;
  marca: string;
  modelo: string;
  color: string;
  anio_modelo: string;
  combustible: string;
  vin: string;
  serie_motor: string;
  sede: string;
  almacen: string;
  dias_en_stock: number | null;
  solicitud_id: number | null;
  solicitud: string | null;
  cliente: string | null;
  asesor: string | null;
}

export interface CurrentInventorySummaryItem {
  estado: string;
  total: number;
  color: string;
}

export type CurrentInventorySummary = CurrentInventorySummaryItem[];

export interface CurrentInventory {
  summary: CurrentInventorySummary;
  items: CurrentInventoryItem[];
}

export interface PurchasesByBrandSede {
  sede_id: number;
  sede_name: string;
  compras: number;
  ventas: number;
  objetivo_sell_in: number;
  objetivo_sell_out: number;
}

export interface PurchasesByBrand {
  brand_id: number;
  brand_name: string;
  total_compras: number;
  total_ventas: number;
  objetivo_sell_in: number;
  objetivo_sell_out: number;
  sedes: PurchasesByBrandSede[];
}

export interface PurchasesBySedeBrand {
  brand_id: number;
  brand_name: string;
  compras: number;
  ventas: number;
  objetivo_sell_in: number;
  objetivo_sell_out: number;
}

export interface PurchasesBySede {
  sede_id: number;
  sede_name: string;
  total_compras: number;
  total_ventas: number;
  objetivo_sell_in: number;
  objetivo_sell_out: number;
  brands: PurchasesBySedeBrand[];
}

export interface PurchasesReport {
  by_brand: PurchasesByBrand[];
  by_sede: PurchasesBySede[];
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
  entregas_detalle: DeliveriesDetail;
  hierarchy: DailyDeliveryHierarchyNode[];
  brand_report: BrandReportSection[];
  purchases_report: PurchasesReport;
  current_inventory: CurrentInventory;
}
