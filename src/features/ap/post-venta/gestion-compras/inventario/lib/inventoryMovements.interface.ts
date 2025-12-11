import { ShipmentsReceptionsResource } from "@/features/ap/comercial/envios-recepciones/lib/shipmentsReceptions.interface";
import { WarehouseResource } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.interface";
import { type Links, type Meta } from "@/shared/lib/pagination.interface";
import { ReceptionResource } from "../../recepciones-producto/lib/receptionsProducts.interface";
import { ProductResource } from "../../../gestion-productos/productos/lib/product.interface";
import { WorkOrderPartsResource } from "../../../taller/orden-trabajo-repuesto/lib/workOrderParts.interface";

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
  reference?:
    | ReceptionResource // type = PURCHASE_RECEPTION
    | ShipmentsReceptionsResource // type = TRANSFER_OUT
    | WorkOrderPartsResource // type = ADJUSTMENT_OUT
    | Record<string, any>;
  details?: InventoryMovementDetail[];
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
