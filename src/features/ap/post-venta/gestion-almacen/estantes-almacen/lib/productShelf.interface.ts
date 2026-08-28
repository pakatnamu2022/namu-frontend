import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";

export interface ProductShelfResource {
  id: number;
  warehouse_id: number;
  warehouse: string;
  code: string;
  label: string;
  notes: string | null;
  status: boolean;
  created_by: number | null;
  creator: string;
  created_at: string;
  updated_at: string;
}

export interface ProductShelfResponse {
  data: ProductShelfResource[];
  links: Links;
  meta: Meta;
}

export interface ProductShelfRequest {
  warehouse_id: number;
  label: string;
  notes?: string;
  status?: boolean;
}

export interface getProductShelfProps {
  params?: Record<string, any>;
}

// ─── Productos asignados a un estante ─────────────────────────────────────────

export interface ShelfProductItem {
  id: number;
  product_warehouse_stock_id: number;
  product_shelf_id: number;
  position: string | null;
  product: {
    id: number;
    code: string;
    name: string;
    quantity: number;
    available_quantity: number;
    stock_status: string;
  };
  warehouse: string;
  shelf: string;
  shelf_code: string;
  created_at: string;
  updated_at: string;
}

// ─── Asignación / remoción de productos ──────────────────────────────────────

export interface AssignShelfProductItem {
  product_warehouse_stock_id: number;
  position?: string;
}

export interface AssignShelfProductsRequest {
  product_shelf_id: number;
  products: AssignShelfProductItem[];
}

export interface RemoveShelfProductRequest {
  product_shelf_id: number;
  product_warehouse_stock_id: number;
}
