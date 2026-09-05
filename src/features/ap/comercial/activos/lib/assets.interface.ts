import { type Links, type Meta } from "@/shared/lib/pagination.interface";
import {
  VehicleResource,
  VehicleClientDebtInfo,
} from "../../vehiculos/lib/vehicles.interface";

export interface AssetVehicle {
  id: number;
  vin: string;
  plate: string | null;
  year: number | null;
  model: string | null;
  brand: string | null;
  color: string | null;
  status: string | null;
  warehouse: string | null;
  sede: string | null;
}

export interface AssetResource {
  id: number;
  ap_vehicle_id: number;
  vehicle: AssetVehicle | null;
  worker_id: number;
  worker: { id: number; name: string } | null;
  assigned_date: string | null;
  observation: string | null;
  dyn_series: string | null;
  migration_status: "pending" | "in_progress" | "completed" | "failed" | "skipped";
  created_at: string | null;
}

export interface AssetResponse {
  data: AssetResource[];
  links: Links;
  meta: Meta;
}

export interface AssetRequest {
  ap_vehicle_id: number;
  worker_id: number;
  assigned_date: string;
  observation?: string;
}

export interface InspectionPhoto {
  label: string;
  url: string;
}

export interface InspectionDamage {
  damage_type: string | null;
  description: string | null;
  photo_url: string | null;
}

export interface ReceptionInspection {
  general_observations: string | null;
  inspected_by_name: string | null;
  photos: InspectionPhoto[];
  damages: InspectionDamage[];
}

export interface EligibleVehicleReception {
  number: string | null;
  issue_date: string | null;
  received_date: string | null;
  inspection?: ReceptionInspection | null;
}

export interface EligibleVehicle {
  id: number;
  vin: string;
  plate: string | null;
  year: number | null;
  model: string | null;
  brand: string | null;
  color: string | null;
  warehouse: string | null;
  sede: string | null;
  has_asset_account: boolean;
  reception: EligibleVehicleReception | null;
}

export interface EligibleVehiclesResponse {
  data: EligibleVehicle[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export type AssetReceptionDetail = NonNullable<
  VehicleClientDebtInfo["reception"]
>;

export interface AssetVehicleDetail {
  id: number;
  has_asset_account: boolean;
  assigned_date: string | null;
  vehicle: VehicleResource;
  reception: AssetReceptionDetail | null;
}

export interface getAssetsProps {
  params?: Record<string, any>;
}

export interface AssetMigrationLog {
  id: number;
  step: string;
  step_name: string;
  status: string;
  status_name: string;
  table_name: string;
  external_id: string;
  proceso_estado: number;
  proceso_estado_name: string | null;
  error_message: string | null;
  attempts: number;
  last_attempt_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AssetMigrationLogsResponse {
  asset: {
    id: number;
    vin: string | null;
    plate: string | null;
    transaction_id: string;
    dyn_series: string | null;
    worker: string | null;
    assigned_date: string | null;
    migration_status: string;
    created_at: string | null;
  };
  logs: AssetMigrationLog[];
}
