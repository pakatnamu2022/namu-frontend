import { type Links, type Meta } from "@/shared/lib/pagination.interface";
import { ModelsVnResource } from "@/features/ap/configuraciones/vehiculos/modelos-vn/lib/modelsVn.interface";
import { CustomersResource } from "../../clientes/lib/customers.interface";

export interface VehicleResponse {
  data: VehicleResource[];
  links: Links;
  meta: Meta;
}

export interface VehicleMovement {
  id: number;
  date: string;
  observation: string;
  status: string;
  status_color: string;
  ap_vehicle_status_id: number;
  ap_vehicle_purchase_order_id: number | null;
}

export interface VehicleResource {
  id: number;
  vin: string;
  plate: string;
  year: number;
  engine_number: string;
  ap_models_vn_id: number;
  vehicle_color_id: number;
  engine_type_id: number;
  ap_vehicle_status_id: number;
  vehicle_color: string;
  engine_type: string;
  status: boolean;
  vehicle_status: string;
  status_color: string;
  warehouse_id?: number;
  warehouse_name?: string;
  warehouse_physical_id?: number;
  warehouse_physical_name?: string;
  sede_name_warehouse_physical?: string;
  sede_name_warehouse?: string;
  model: ModelsVnResource;
  movements: VehicleMovement[];
  owner?: owner;
  billed_cost?: number;
  freight_cost?: number;
}

export interface Owner {
  has_purchase_order: boolean;
  is_cancelled: boolean;
  is_paid: boolean;
  client: CustomersResource;
}

export interface VehicleResourceWithCosts {
  id: number;
  vin: string;
  year: number;
  engine_number: string;
  ap_models_vn_id: number;
  vehicle_color_id: number;
  engine_type_id: number;
  ap_vehicle_status_id: number;
  model: string;
  model_code: string;
  family: string;
  vehicle_color: string;
  engine_type: string;
  status: number;
  vehicle_status: string;
  status_color: string;
  warehouse_physical_id: number;
  warehouse_physical: string;
  billed_cost: string;
  freight_cost: string;
}

export interface VehicleRequest {
  vin: string;
  year: number;
  engine_number: string;
  ap_models_vn_id: number;
  vehicle_color_id: number;
  supplier_order_type_id: number;
  engine_type_id: number;
  ap_vehicle_status_id: number;
  sede_id: number;
  warehouse_physical_id?: number | null;
}

export interface GetVehiclesProps {
  params?: Record<string, any>;
}

export interface VehicleClientDebtInfo {
  vehicle: {
    id: number;
    vin: string;
    model_code: string;
    year: number;
    engine_number: string;
    engineType: string;
    model: string;
    warehouse_physical: string;
  };
  client: {
    id: number;
    num_doc: string;
    full_name: string;
    direction: string;
    email: string;
  };
  purchase_quote: {
    id: number;
    correlative: string;
    sale_price: number;
  };
  debt_summary: {
    total_sale_price: number;
    total_paid: number;
    pending_debt: number;
    status: string;
    message: string;
    has_pending_debt: boolean;
    debt_is_paid: boolean;
  };
  documents_summary: {
    total_documents: number;
    total_facturas: number;
    total_notas_credito: number;
    total_notas_debito: number;
  };
  facturas: Array<{
    id: number;
    serie: string;
    numero: number;
    document_number: string;
    fecha_emision: string;
    moneda: string;
    total: string;
    tipo_documento: string;
  }>;
  notas_credito: any[];
  notas_debito: any[];
}
