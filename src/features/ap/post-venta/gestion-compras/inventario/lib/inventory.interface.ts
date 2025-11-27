import { type Links, type Meta } from "@/shared/lib/pagination.interface";

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

export interface InventoryProductUnitMeasurement {
  id: number;
  dyn_code: string;
  nubefac_code: string;
  description: string;
  status: boolean;
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
  sunat_code: string | null;
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
  unit_measurement: InventoryProductUnitMeasurement;
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
  warehouse_id: number;
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
  stock_status: "LOW_STOCK" | "OUT_OF_STOCK" | "NORMAL";
  total_expected_stock: number;
  product: InventoryProduct;
  warehouse: InventoryWarehouse;
  created_at: string;
  updated_at: string;
}

export interface InventoryResponse {
  data: InventoryResource[];
  links: Links;
  meta: Meta;
}

export interface getInventoryProps {
  params?: Record<string, any>;
}
