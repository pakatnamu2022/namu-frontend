import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface ExhibitionVehiclesResponse {
  data: ExhibitionVehiclesResource[];
  links: Links;
  meta: Meta;
}

export interface ExhibitionVehiclesResource {
  id: number;
  supplier_id: number;
  supplier: {
    id: number;
    full_name: string;
    num_doc: string;
  };
  guia_number: string;
  guia_date: string;
  llegada: string;
  ubicacion_id: number;
  ubicacion: {
    id: number;
    description: string;
    sede_id: number;
    sede_name: string;
  };
  advisor_id: number | null;
  advisor: {
    id: number;
    nombre_completo: string;
  } | null;
  propietario_id: number | null;
  propietario: {
    id: number;
    nombre_completo: string;
  } | null;
  ap_vehicle_status_id: number;
  vehicle_status: string;
  pedido_sucursal: string | null;
  dua_number: string;
  observaciones: string;
  status: boolean;
  items: ExhibitionVehicleItem[];
  created_at: string;
  updated_at: string;
}

export interface ExhibitionVehicleItem {
  id: number;
  item_type: "vehicle" | "equipment";
  description: string;
  quantity: number;
  observaciones: string | null;
  status: boolean;
  vehicle?: VehicleData | null;
}

export interface VehicleData {
  id: number;
  vin: string;
  plate: string;
  year: number;
  engine_number: string;
  ap_vehicle_status_id: number;
  vehicle_status: string;
  vehicle_color_id: number;
  vehicle_color: string;
  model_id: number;
  model_version: string;
  family: string;
  brand: string;
}

export interface ExhibitionVehiclesRequest {
  supplier_id: number;
  guia_number: string;
  guia_date: string | Date;
  llegada: string | Date;
  ubicacion_id: number;
  advisor_id?: number | null;
  propietario_id?: number | null;
  ap_vehicle_status_id: number;
  pedido_sucursal?: string;
  dua_number: string;
  observaciones?: string;
  status: boolean;
  items: ExhibitionVehicleItemRequest[];
}

export interface ExhibitionVehicleItemRequest {
  item_type: "vehicle" | "equipment";
  description: string;
  quantity: number;
  observaciones?: string;
  status: boolean;
  vehicle_data?: VehicleDataRequest;
}

export interface VehicleDataRequest {
  vin: string;
  year: number;
  engine_number: string;
  ap_models_vn_id: number;
  vehicle_color_id: number;
  engine_type_id: number;
  plate?: string;
  ap_vehicle_status_id: number;
  warehouse_id: number;
}

export interface getExhibitionVehiclesProps {
  params?: {
    page?: number;
    per_page?: number;
    search?: string;
    advisor_id?: number | null;
    ap_vehicle_status_id?: number[];
    propietario_id?: number | null;
    status?: boolean | null;
    ubicacion_id?: number | null;
    vehicle_id?: number | null;
  };
}
