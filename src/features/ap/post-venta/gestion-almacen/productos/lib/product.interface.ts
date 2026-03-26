import { WarehouseResource } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.interface";
import { UnitMeasurementResource } from "@/features/ap/configuraciones/maestros-general/unidad-medida/lib/unitMeasurement.interface";
import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";
import { ProductCategoryResource } from "../../categorias-producto/lib/productCategory.interface";
import { BrandsResource } from "@/features/ap/configuraciones/vehiculos/marcas/lib/brands.interface";

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
  cost_price: number;
  average_cost: number;
  sale_price: number;
  last_movement_date: string | null;
  is_low_stock: boolean;
  is_out_of_stock: boolean;
  stock_status: "NORMAL" | "LOW" | "OUT";
  warehouse: WarehouseResource;
  created_at: string;
  updated_at: string;
}

export interface ProductResource {
  id: number;
  code: string;
  dyn_code?: string;
  name: string;
  description?: string;
  product_category_id: number;
  brand_id?: number;
  unit_measurement_id: number;
  ap_class_article_id: number;
  warranty_months?: number;
  status: "ACTIVE" | "INACTIVE" | "DISCONTINUED";
  has_purchase_order: boolean;

  // Computed/appended fields from backend
  brand_name?: string;
  category_name?: string;
  unit_measurement_name?: string;
  total_stock?: number;
  total_available_stock?: number;
  price_with_tax?: number;
  cost_with_tax?: number;

  // Nested relations (when included)
  warehouse_stocks?: WarehouseStockDetail[];
  category?: ProductCategoryResource;
  brand?: BrandsResource;
  unit_measurement?: UnitMeasurementResource;
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
  name: string;
  description?: string;
  product_category_id: string;
  brand_id?: string;
  unit_measurement_id: string;
  ap_class_article_id: string;
  warranty_months?: number;
  notes?: string;
  status?: "ACTIVE" | "INACTIVE" | "DISCONTINUED";
  // Warehouse stock configuration (only for create)
  warehouses?: WarehouseStock[];
}

export interface getProductProps {
  params?: Record<string, any>;
}
