import { ShipmentsReceptionsResource } from "@/features/ap/comercial/envios-recepciones/lib/shipmentsReceptions.interface.ts";
import { WarehouseResource } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.interface.ts";
import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";
import { ReceptionResource } from "@/features/ap/post-venta/gestion-almacen/recepciones-producto/lib/receptionsProducts.interface.ts";
import { ProductResource } from "@/features/ap/post-venta/gestion-almacen/productos/lib/product.interface.ts";
import { WorkOrderPartsResource } from "../../../taller/orden-trabajo-repuesto/lib/workOrderParts.interface.ts";
import { OrderQuotationResource } from "../../../taller/cotizacion/lib/proforma.interface.ts";
import { ApMastersResource } from "@/features/ap/ap-master/lib/apMasters.interface.ts";
import { TransferReceptionResource } from "../../recepcion-transferencia/lib/transferReception.interface.ts";

export interface InventoryMovementDetail {
  id: number;
  inventory_movement_id: number;
  product_id: number;
  product: ProductResource;
  quantity: string;
  unit_cost: string;
  total_cost: string;
}

export interface InventoryMovementResource {
  id: number;
  movement_date: string;
  movement_type: string;
  movement_number: string;
  quantity_in: number;
  quantity_out: number;
  notes?: string;
  user_name?: string;
  warehouse_origin?: WarehouseResource;
  warehouse_destination?: WarehouseResource;
  is_inbound?: boolean;
  is_outbound?: boolean;
  created_at: string;
  reference_type: string;
  reference?:
    | ReceptionResource // type = PURCHASE_RECEPTION
    | ShipmentsReceptionsResource // type = TRANSFER_OUT
    | WorkOrderPartsResource // type = ADJUSTMENT_OUT
    | OrderQuotationResource // type = SALE, ADJUSTMENT_OUT
    | TransferReceptionResource // type = TRANSFER_IN
    | Record<string, any>;
  details?: InventoryMovementDetail[];
  reason_in_out_id: number; // type = ADJUSTMENT_OUT, ADJUSTMENT_IN
  reason_in_out: ApMastersResource; // type = ADJUSTMENT_OUT, ADJUSTMENT_IN
}

export interface InventoryMovementResponse {
  data: InventoryMovementResource[];
  links: Links;
  meta: Meta;
}

export interface getInventoryMovementProps {
  productId: number;
  warehouseId: number;
  params?: Record<string, any>;
}

export interface getInventoryKardexProps {
  params?: Record<string, any>;
}

export interface getProductPurchaseHistoryProps {
  productId: number;
  warehouseId: number;
  params?: {
    date_from?: string;
    date_to?: string;
  };
}

export interface PurchaseHistoryProduct {
  id: number;
  name: string;
  code: string;
  dyn_code: string;
}

export interface PurchaseHistoryWarehouse {
  id: number;
  name: string | null;
}

export interface PurchaseHistorySummary {
  total_purchases: number;
  total_quantity: number;
  total_amount: number;
  average_price: number;
  min_price: string;
  max_price: string;
}

export interface PurchaseHistoryPurchaseOrder {
  id: number;
  number: string;
  emission_date: string;
  invoice_series: string;
  invoice_number: string;
}

export interface PurchaseHistorySupplier {
  id: number;
  name: string;
  document: string;
}

export interface PurchaseHistoryCurrency {
  id: number;
  name: string;
  symbol: string;
}

export interface PurchaseHistoryItem {
  id: number;
  reception_id: number;
  reception_number: string;
  reception_date: string;
  purchase_order: PurchaseHistoryPurchaseOrder;
  supplier: PurchaseHistorySupplier;
  currency: PurchaseHistoryCurrency;
  unit_price: string;
  quantity_ordered: string;
  quantity_received: string;
  total_line: string;
  reception_type: string;
  batch_number: string | null;
  expiration_date: string | null;
  received_by: string;
  notes: string | null;
}

export interface PurchaseHistoryResponse {
  product: PurchaseHistoryProduct;
  warehouse: PurchaseHistoryWarehouse;
  summary: PurchaseHistorySummary;
  purchases: PurchaseHistoryItem[];
}
