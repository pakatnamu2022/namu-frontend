import { VehiclePurchaseOrderResource } from "@/features/ap/comercial/ordenes-compra-vehiculo/lib/vehiclePurchaseOrder.interface";
import { SuppliersResource } from "@/features/ap/comercial/proveedores/lib/suppliers.interface";
import { WarehouseResource } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.interface";
import { CurrencyTypesResource } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.interface";
import { SedeResource } from "@/features/gp/maestro-general/sede/lib/sede.interface";
import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface SupplierOrderResponse {
  data: SupplierOrderResource[];
  links: Links;
  meta: Meta;
}

export interface SupplierOrderDetailsResource {
  id: number;
  ap_supplier_order_id: number;
  product_id: number;
  unit_measurement_id: number;
  note: string | null;
  unit_price: number;
  quantity: number;
  total: number;
  product?: {
    id: number;
    code: string;
    name: string;
    description: string;
  };
}

export interface SupplierOrderResource {
  id: number;
  supplier_id: number;
  sede_id: number;
  warehouse_id: number;
  type_currency_id: number;
  created_by: number;
  created_by_name: string;
  order_date: string;
  order_number: string;
  supply_type: string;
  net_amount: number;
  tax_amount: number;
  total_amount: number;
  is_take: boolean;
  has_invoice: boolean;
  status: boolean;
  supplier?: SuppliersResource;
  sede?: SedeResource;
  warehouse?: WarehouseResource;
  type_currency?: CurrencyTypesResource;
  invoice?: VehiclePurchaseOrderResource;
  details: SupplierOrderDetailsResource[];
  purchase_requests?: [
    {
      id: number;
      request_number: string;
      requested_by: number;
      requested_by_name: string;
    }
  ];
}

export interface SupplierOrderDetailsRequest {
  product_id: string;
  unit_measurement_id: string;
  note: string;
  unit_price: number;
  quantity: number;
  total: number;
}

export interface SupplierOrderRequest {
  supplier_id: string;
  sede_id: string;
  warehouse_id: string;
  type_currency_id: string;
  order_date: string;
  supply_type: string;
  details: SupplierOrderDetailsRequest[];
}

export interface getSupplierOrderProps {
  params?: Record<string, any>;
}
