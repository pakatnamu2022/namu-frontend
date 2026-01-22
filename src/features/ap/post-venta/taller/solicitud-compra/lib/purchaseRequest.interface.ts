import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";
import { ProductResource } from "@/features/ap/post-venta/gestion-almacen/productos/lib/product.interface";
import { WarehouseResource } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.interface";
import { OrderQuotationResource } from "../../cotizacion/lib/proforma.interface";

export interface PurchaseRequestResponse {
  data: PurchaseRequestResource[];
  links: Links;
  meta: Meta;
}

export interface PurchaseRequestResource {
  id: number;
  request_number: string;
  ap_order_quotation_id: number | null;
  purchase_order_id: number | null;
  warehouse_id: number;
  requested_date: string;
  advisor_notified: boolean;
  notified_at: string | null;
  observations: string | null;
  status: string;
  status_color?: string;
  created_at: string;
  updated_at: string;
  supply_type: "STOCK" | "LIMA" | "IMPORTACION";
  requested_by: string;
  details?: PurchaseRequestDetailResource[];
  warehouse: WarehouseResource;
  ap_order_quotation?: OrderQuotationResource;
}

export interface PurchaseRequestDetailResponse {
  data: PurchaseRequestDetailResource[];
  links: Links;
  meta: Meta;
}

export interface PurchaseRequestDetailResource {
  id: number;
  ap_purchase_request_id: number;
  product_id: number;
  product_name?: string;
  quantity: number;
  notes: string | null;
  requested_delivery_date: string | null;
  created_at: string;
  updated_at: string;
  product_code?: string;
  request_number?: string;
  requested_name?: string;
  product?: ProductResource;
}

export interface PurchaseRequestRequest {
  ap_order_quotation_id?: string;
  purchase_order_id?: string;
  warehouse_id: string;
  requested_date: string | Date;
  observations?: string;
  status?: string;
  details: PurchaseRequestDetailRequest[];
}

export interface PurchaseRequestDetailRequest {
  product_id: string;
  quantity: number;
  notes?: string;
  requested_delivery_date?: string | Date;
}

export interface getPurchaseRequestProps {
  params?: Record<string, any>;
}
