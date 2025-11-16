import { Links, Meta } from "@/shared/lib/pagination.interface";
import { VehicleResource } from "../../vehiculos/lib/vehicles.interface";
import { ClassArticleResource } from "../../../configuraciones/maestros-general/clase-articulo/lib/classArticle.interface";

export interface VehiclePurchaseOrderResponse {
  data: VehiclePurchaseOrderResource[];
  links: Links;
  meta: Meta;
}

export interface VehiclePurchaseOrderMovement {
  id: number;
  date: string;
  observation: string;
  status: string;
  status_color: string;
  ap_vehicle_status_id: number;
  ap_vehicle_purchase_order_id: number;
}

export interface PurchaseOrderItem {
  id?: number;
  unit_measurement_id?: number;
  description: string;
  unit_price: string | number;
  quantity: number;
  total?: number;
  is_vehicle: boolean;
  unit_measurement?: {
    id: number;
    dyn_code: string;
    nubefac_code: string;
    description: string;
    status: boolean;
  };
}

export interface VehicleData {
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
  vehicle_color: string;
  engine_type: string;
  status: number;
  vehicle_status: string;
  status_color: string;
  warehouse_physical_id?: number | null;
  warehouse_physical?: string | null;
  movements?: VehiclePurchaseOrderMovement[];
}

export interface VehiclePurchaseOrderResource {
  id: number;
  number: string;
  number_guide: string;
  invoice_series: string;
  invoice_number: string;
  emission_date: string;
  due_date?: string;
  subtotal: string | number;
  igv: string | number;
  total: string | number;
  discount?: string | number;
  isc?: string | number;
  sede_id: number;
  sede: string;
  supplier: string;
  supplier_num_doc: string;
  supplier_order_type: string;
  currency: string;
  currency_code: string;
  warehouse: string;
  article_class: ClassArticleResource;
  vehicle?: VehicleResource;
  items?: PurchaseOrderItem[];
  resent: boolean;
  status: boolean;
  migration_status: string;
  invoice_dynamics: string;
  receipt_dynamics: string;
  credit_note_dynamics?: string;
  vehicleMovement?: VehiclePurchaseOrderMovement;
  migrated_at: string;
  created_at: string;
  updated_at: string;

  // Campos legacy (por compatibilidad con código anterior)
  vin?: string;
  year?: number;
  engine_number?: string;
  ap_models_vn_id?: number;
  vehicle_color_id?: number;
  supplier_order_type_id?: number;
  engine_type_id?: number;
  ap_vehicle_status_id?: number;
  supplier_id?: number;
  currency_id?: number;
  warehouse_id?: number;
  warehouse_physical_id?: number;
  exchange_rate_id?: number;
  unit_price?: string;
  po_status?: boolean;
  model?: string;
  model_code?: string;
  vehicle_color?: string;
  engine_type?: string;
  status_color?: string;
  warehouse_physical?: string;
  taxClassType?: string;
  movements?: VehiclePurchaseOrderMovement[];
}

export interface VehiclePurchaseOrderRequest {
  // Vehicle
  vin: string;
  year: number;
  engine_number: string;
  ap_models_vn_id: string;
  vehicle_color_id: string;
  supplier_order_type_id: string;
  engine_type_id: string;
  sede_id: string;
  // Invoice
  invoice_series: string;
  invoice_number: string;
  emission_date: string;
  unit_price: number;
  discount: number;
  supplier_id: string;
  currency_id: string;
  // Warehouse
  warehouse_id: string;
}

export interface GetVehiclePurchaseOrderProps {
  params?: Record<string, any>;
}

// Migration interfaces
export interface MigrationLog {
  id: number;
  step: string;
  step_name: string;
  status: string;
  status_name: string;
  table_name: string;
  external_id: string;
  proceso_estado: number;
  proceso_estado_name: string;
  error_message?: string;
  attempts: number;
  last_attempt_at: string;
  completed_at: string;
  created_at: string;
  updated_at: string;
}

export interface MigrationLogsResponse {
  success: boolean;
  data: {
    purchase_order: {
      id: number;
      number: string;
      number_guide: string;
      migration_status: string;
      migrated_at: string;
      created_at: string;
    };
    logs: MigrationLog[];
  };
}

export interface MigrationEvent {
  timestamp: string;
  event: string;
  description: string;
  status: string;
  error?: string;
  proceso_estado?: number;
}

export interface MigrationTimelineStep {
  step: string;
  step_name?: string;
  events: MigrationEvent[];
}

export interface MigrationHistoryResponse {
  success: boolean;
  data: {
    purchase_order: {
      id: number;
      number: string;
      number_guide: string;
      migration_status: string;
      migrated_at: string;
    };
    timeline: MigrationTimelineStep[];
  };
}
