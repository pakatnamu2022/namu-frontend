import { CurrencyTypesResource } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.interface";
import { UnitMeasurementResource } from "@/features/ap/configuraciones/maestros-general/unidad-medida/lib/unitMeasurement.interface";
import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";

export interface InventoryProductCategory {
  id: number;
  name: string;
  description: string;
  status: number;
  type_id: number;
  created_at: string;
  updated_at: string;
}

export interface InventoryProductBrand {
  id: number;
  code: string;
  dyn_code: string;
  name: string;
  description: string;
  logo: string;
  logo_min: string;
  type_operation_id: number;
  status: number;
  group_id: number;
  group: string;
  sede_id: number | null;
}

export interface InventoryProduct {
  id: number;
  code: string;
  dyn_code: string;
  nubefac_code: string | null;
  name: string;
  description: string;
  product_category_id: number;
  brand_id: number;
  unit_measurement_id: number;
  ap_class_article_id: number;
  cost_price: string;
  sale_price: string;
  tax_rate: string;
  is_taxable: boolean;
  warranty_months: number;
  status: string;
  brand_name: string;
  category_name: string;
  unit_measurement_name: string;
  total_stock: number;
  total_available_stock: number;
  price_with_tax: number;
  cost_with_tax: number;
  category: InventoryProductCategory;
  brand: InventoryProductBrand;
  unit_measurement: UnitMeasurementResource;
}

export interface InventoryWarehouse {
  id: number;
  dyn_code: string;
  description: string;
  article_class_id: string;
  article_class: string;
  sede_id: number;
  sede: string;
  type_operation_id: number;
  type_operation: string;
  status: number;
  is_received: number;
  inventory_account: string | null;
  counterparty_account: string | null;
  is_physical_warehouse: number;
  parent_warehouse_id: string;
  parent_warehouse_dyn_code: string;
}

export interface InventoryResource {
  id: number;
  product_id: number;
  product_name: string;
  warehouse_id: number;
  warehouse_name: string;
  quantity: number;
  quantity_in_transit: number;
  quantity_pending_credit_note: number;
  reserved_quantity: number;
  available_quantity: number;
  minimum_stock: number;
  maximum_stock: number;
  last_movement_date: string;
  is_low_stock: boolean;
  is_out_of_stock: boolean;
  //Costos
  cost_price: string;
  sale_price: string;
  tax_rate: string;
  is_taxable: boolean;

  stock_status: "LOW_STOCK" | "OUT_OF_STOCK" | "NORMAL";
  product: InventoryProduct;
  warehouse: InventoryWarehouse;
  created_at: string;
  updated_at: string;
}

export interface StockByProductIdsResponse {
  success: boolean;
  data: ProductStock[];
}

export interface ProductStock {
  product_id: number;
  product_name: string | null;
  product_code: string | null;
  warehouses: WarehouseStock[];
  total_quantity: number;
  total_quantity_in_transit: number;
  total_available_quantity: number;
}

export interface WarehouseStock {
  sede_id: number;
  warehouse_id: number;
  warehouse_name: string;
  quantity: number;
  quantity_in_transit: number;
  reserved_quantity: number;
  available_quantity: number;
  minimum_stock: number;
  maximum_stock: number;
  last_purchase_price: number;
  days_without_movement: number;
  public_sale_price: number;
  minimum_sale_price: number;
  stock_status: "NORMAL" | "LOW_STOCK" | "OUT_OF_STOCK" | "OVER_STOCK";
  is_low_stock: boolean;
  is_out_of_stock: boolean;
  last_movement_date: string;
  currency: CurrencyTypesResource;
}

export interface InventoryResponse {
  data: InventoryResource[];
  links: Links;
  meta: Meta;
}

export interface getInventoryProps {
  params?: Record<string, any>;
}

// --- Comparativa Dynamics ---

export interface CompareDynamicsProduct {
  product_dyn_code: string;
  product_code: string | null;
  product_name: string | null;
  warehouse_dynamics: string | null;
  local_quantity: string | null;
  local_available: string | null;
  local_in_transit: string | null;
  local_reserved: string | null;
  local_pending_credit_note: string | null;
  dynamics_stock: number | null;
  difference: number | null;
  match: boolean;
  found_in: "SOLO_LOCAL" | "SOLO_DYNAMICS" | "AMBOS";
}

export interface CompareDynamicsData {
  warehouse_id: number;
  warehouse_code: string;
  warehouse_description: string;
  comparison_date: string;
  total_products: number;
  matching_products: number;
  products: CompareDynamicsProduct[];
}

export interface CompareDynamicsResponse {
  success: boolean;
  data: CompareDynamicsData;
}

/** Fila unificada (merge de la entrada local + la entrada de Dynamics) */
export interface CompareDynamicsMergedRow {
  product_dyn_code: string;
  product_code: string | null;
  product_name: string | null;
  warehouse_dynamics: string | null;
  local_quantity: string | null;
  local_available: string | null;
  local_in_transit: string | null;
  local_reserved: string | null;
  local_pending_credit_note: string | null;
  dynamics_stock: number | null;
  difference: number | null;
  match: boolean;
  found_in: "SOLO_LOCAL" | "SOLO_DYNAMICS" | "AMBOS";
}

/**Interface para modificar stock minimo y maximo del inventario */
export interface InventoryStockMinMaxResource {
  minimum_stock: string;
  maximum_stock: string;
  product_id: string;
  warehouse_id: string;
}

// ─── Price Calculation Details ────────────────────────────────────────────────

export interface PriceCalculationPrices {
  last_purchase_price: number;
  average_cost: number;
  public_sale_price: number;
  calculated_pvp: number;
  minimum_sale_price: number;
  price_matches: boolean;
}

export interface PriceCalculationConfiguration {
  profit_margin: number;
  profit_margin_percent: string;
  freight_commission: number;
  freight_commission_percent: string;
  minimum_discount: number;
  minimum_discount_percent: string;
  calculation_method: number;
}

export interface PriceCalculationSummary {
  product_id: number;
  product_code: string;
  product_name: string;
  warehouse_id: number;
  warehouse_name: string;
  currency: string;
  current_stock: number;
  prices: PriceCalculationPrices;
  configuration: PriceCalculationConfiguration;
}

export interface CalculationStepData {
  [key: string]: string | number | boolean | null | undefined;
}

export interface CalculationStep {
  step: number;
  title: string;
  description: string;
  data: CalculationStepData;
  development?: Record<string, string | number | boolean | null | undefined>;
  formula?: string;
  calculation_details?: string;
  message: string;
}

export interface PriceCalculationDetailsResponse {
  success: boolean;
  summary: PriceCalculationSummary;
  calculation_steps: CalculationStep[];
  generated_at: string;
}

// ─── Stock Movement History ───────────────────────────────────────────────────

export interface StockMovementHistoryItem {
  movement_id?: number;
  movement_date: string | null;
  movement_number: string;
  movement_type: string;
  movement_type_label: string;
  is_inbound: boolean | null;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  stock_after_movement: number;
  average_cost_after_movement: number;
  currency: string;
  exchange_rate?: number;
  created_at: string | null;
}

export interface StockMovementHistoryResponse {
  success: boolean;
  product_id: number;
  product_code: string;
  product_name: string;
  warehouse_id: number;
  warehouse_name: string;
  current_stock_database: number;
  current_average_cost_database: number;
  calculated_final_stock: number;
  calculated_final_average_cost: number;
  stock_matches: boolean;
  average_cost_matches: boolean;
  total_movements: number;
  history: StockMovementHistoryItem[];
  generated_at: string;
}

// ─── Reserved Stock Report ────────────────────────────────────────────────────

export interface ReservedStockReportReservationOT {
  work_order_id: number;
  work_order_correlative: string;
  work_order_status_id: number;
  work_order_status: string;
  sede_name: string;
  quantity_reserved: string;
  reserved_at: string;
  reserved_by_user_id: number;
  reserved_by_user_name: string;
}

export interface ReservedStockReportReservationRP {
  quotation_id: number;
  quotation_number: string;
  quotation_status: string;
  sede_name: string;
  quantity_reserved: string;
  reserved_at: string;
  reserved_by_user_id: number;
  reserved_by_user_name: string;
}

export interface ReservedStockReportItem {
  product_id: number;
  product_code: string;
  product_dyn_code: string;
  product_name: string;
  warehouse_id: number;
  warehouse_name: string | null;
  total_reserved_quantity: string;
  physical_stock: string;
  available_quantity: string;
  reservations_ot: ReservedStockReportReservationOT[];
  reservations_rp: ReservedStockReportReservationRP[];
}

export interface ReservedStockReportSummary {
  total_products_with_reservations: number;
  total_reserved_quantity: number;
  total_work_orders: number;
}

export interface ReservedStockReportResponse {
  success: boolean;
  data: ReservedStockReportItem[];
  summary: ReservedStockReportSummary;
}

export interface getReservedStockReportProps {
  warehouse_id?: number | string;
  product_id?: number | string;
}
