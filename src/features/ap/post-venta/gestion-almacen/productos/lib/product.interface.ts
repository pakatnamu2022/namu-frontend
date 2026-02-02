import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";

export interface ProductResponse {
  data: ProductResource[];
  links: Links;
  meta: Meta;
}

export interface WarehouseStockDetail {
  id: number;
  product_id: number;
  warehouse_id: number;
  quantity: number;
  quantity_in_transit: number;
  quantity_pending_credit_note: number;
  reserved_quantity: number;
  available_quantity: number;
  minimum_stock: number;
  maximum_stock: number;
  last_movement_date: string | null;
  is_low_stock: boolean;
  is_out_of_stock: boolean;
  stock_status: "NORMAL" | "LOW" | "OUT";
  warehouse: {
    id: number;
    dyn_code: string;
    description: string;
    article_class_id: number;
    article_class: string;
    sede_id: number;
    sede: string;
    type_operation_id: number;
    type_operation: string;
    status: number;
    is_received: number;
    inventory_account: string;
    counterparty_account: string;
  };
  created_at: string;
  updated_at: string;
}

export interface ProductCategory {
  id: number;
  code: string;
  description: string;
  status: number;
  type: number;
}

export interface ProductBrand {
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

export interface ProductUnitMeasurement {
  id: number;
  dyn_code: string;
  nubefac_code: string;
  description: string;
  status: boolean;
}

export interface ProductResource {
  id: number;
  code: string;
  dyn_code?: string;
  nubefac_code?: string | null;
  name: string;
  description?: string;
  product_category_id: number;
  brand_id?: number;
  unit_measurement_id: number;
  ap_class_article_id: number;
  cost_price?: string;
  sale_price: string;
  tax_rate?: string;
  is_taxable?: boolean;
  sunat_code?: string | null;
  warranty_months?: number;
  status: "ACTIVE" | "INACTIVE" | "DISCONTINUED";

  // Computed/appended fields from backend
  brand_name?: string;
  category_name?: string;
  unit_measurement_name?: string;
  total_stock?: number;
  total_available_stock?: number;
  price_with_tax?: number;
  cost_with_tax?: number;
  has_purchase_order: boolean;

  // Nested relations (when included)
  warehouse_stocks?: WarehouseStockDetail[];
  category?: ProductCategory;
  brand?: ProductBrand;
  unit_measurement?: ProductUnitMeasurement;
}

export interface WarehouseStock {
  warehouse_id: string;
  initial_quantity?: number;
  minimum_stock?: number;
  maximum_stock?: number;
}

export interface ProductRequest {
  code: string;
  dyn_code?: string;
  nubefac_code?: string;
  name: string;
  description?: string;
  product_category_id: string;
  brand_id?: string;
  unit_measurement_id: string;
  ap_class_article_id: string;
  cost_price?: number;
  sale_price: number;
  warranty_months?: number;
  notes?: string;
  status?: "ACTIVE" | "INACTIVE" | "DISCONTINUED";
  // Warehouse stock configuration (only for create)
  warehouses?: WarehouseStock[];
}

export interface getProductProps {
  params?: Record<string, any>;
}
