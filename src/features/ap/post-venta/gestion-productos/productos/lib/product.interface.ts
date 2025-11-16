import { Links, Meta } from "@/shared/lib/pagination.interface";

export interface ProductResponse {
  data: ProductResource[];
  links: Links;
  meta: Meta;
}

export interface ProductResource {
  id: number;
  code: string;
  dyn_code?: string;
  nubefac_code?: string;
  name: string;
  description?: string;
  product_category_id: number;
  product_category_name?: string;
  brand_id?: number;
  brand_name?: string;
  unit_measurement_id: number;
  unit_measurement_name?: string;
  warehouse_id?: number;
  warehouse_name?: string;
  ap_class_article_id: number;
  ap_class_article_name?: string;
  product_type: "GOOD" | "SERVICE" | "KIT";
  minimum_stock: number;
  maximum_stock: number;
  current_stock?: number;
  cost_price?: number;
  sale_price: number;
  tax_rate?: number;
  is_taxable?: boolean;
  sunat_code?: string;
  warranty_months?: number;
  notes?: string;
  status: "ACTIVE" | "INACTIVE" | "DISCONTINUED";
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
  warehouse_id?: string;
  ap_class_article_id: string;
  product_type: "GOOD" | "SERVICE" | "KIT";
  minimum_stock?: number;
  maximum_stock?: number;
  current_stock?: number;
  cost_price?: number;
  sale_price: number;
  tax_rate?: number;
  is_taxable?: boolean;
  sunat_code?: string;
  warranty_months?: number;
  notes?: string;
  status: "ACTIVE" | "INACTIVE" | "DISCONTINUED";
}

export interface getProductProps {
  params?: Record<string, any>;
}
