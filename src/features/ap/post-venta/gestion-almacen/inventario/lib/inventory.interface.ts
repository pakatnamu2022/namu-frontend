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

interface ProductStock {
  product_id: number;
  product_name: string | null;
  product_code: string | null;
  warehouses: WarehouseStock[];
  total_quantity: number;
  total_quantity_in_transit: number;
  total_available_quantity: number;
}

interface WarehouseStock {
  warehouse_id: number;
  warehouse_name: string;
  quantity: number;
  quantity_in_transit: number;
  reserved_quantity: number;
  available_quantity: number;
  minimum_stock: number;
  maximum_stock: number;
  stock_status: "NORMAL" | "LOW_STOCK" | "OUT_OF_STOCK" | "OVER_STOCK";
  is_low_stock: boolean;
  is_out_of_stock: boolean;
  last_movement_date: string;
  last_purchase_price: number;
  public_sale_price: number;
  minimum_sale_price: number;
}

export interface InventoryResponse {
  data: InventoryResource[];
  links: Links;
  meta: Meta;
}

export interface getInventoryProps {
  params?: Record<string, any>;
}
