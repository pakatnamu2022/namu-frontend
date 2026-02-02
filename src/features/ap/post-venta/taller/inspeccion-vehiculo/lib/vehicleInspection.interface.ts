import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";

export interface VehicleInspectionResponse {
  data: VehicleInspectionResource[];
  links: Links;
  meta: Meta;
}

export interface VehicleInspectionResource {
  id: number;
  mileage: string;
  fuel_level: string;
  oil_level: string;
  dirty_unit: boolean;
  unit_ok: boolean;
  title_deed: boolean;
  soat: boolean;
  moon_permits: boolean;
  service_card: boolean;
  owner_manual: boolean;
  key_ring: boolean;
  wheel_lock: boolean;
  safe_glasses: boolean;
  radio_mask: boolean;
  lighter: boolean;
  floors: boolean;
  seat_cover: boolean;
  quills: boolean;
  antenna: boolean;
  glasses_wheel: boolean;
  emblems: boolean;
  spare_tire: boolean;
  fluid_caps: boolean;
  tool_kit: boolean;
  jack_and_lever: boolean;
  general_observations: string | null;
  inspected_by: number;
  inspected_by_name: string;
  inspection_date: string | Date;
  customer_signature_url: string;
  photo_front_url: string;
  photo_back_url: string;
  photo_left_url: string;
  photo_right_url: string;
  damages?: VehicleInspectionDamageResource[];
  // Campos de vehículo (desde la orden de trabajo)
  vehicle_id?: number;
  vehicle_plate?: string;
  vehicle_vin?: string;
  vehicle_model?: string;
  vehicle_brand?: string;
  vehicle_year?: string;
  vehicle_color?: string;
  work_order_correlative?: string;
  work_order_id?: number;
}

export interface VehicleInspectionDamageResource {
  id: number;
  vehicle_inspection_id: number;
  damage_type: string;
  location?: string;
  x_coordinate?: number | string;
  y_coordinate?: number | string;
  description: string;
  photo_url: string;
  created_at?: string;
  updated_at?: string;
}

export interface VehicleInspectionRequest {
  work_order_id: string;
  dirty_unit: boolean;
  unit_ok: boolean;
  title_deed: boolean;
  soat: boolean;
  moon_permits: boolean;
  service_card: boolean;
  owner_manual: boolean;
  key_ring: boolean;
  wheel_lock: boolean;
  safe_glasses: boolean;
  radio_mask: boolean;
  lighter: boolean;
  floors: boolean;
  seat_cover: boolean;
  quills: boolean;
  antenna: boolean;
  glasses_wheel: boolean;
  emblems: boolean;
  spare_tire: boolean;
  fluid_caps: boolean;
  tool_kit: boolean;
  jack_and_lever: boolean;
  general_observations?: string;
  inspection_date: string | Date;
  damages: VehicleInspectionDamageRequest[];
  // Fotos del vehículo (obligatorias cuando dirty_unit es true)
  photo_front?: File | null;
  photo_back?: File | null;
  photo_left?: File | null;
  photo_right?: File | null;
}

export interface VehicleInspectionDamageRequest {
  damage_type: string;
  x_coordinate?: number;
  y_coordinate?: number;
  description?: string;
  photo_url?: string;
}

export interface getVehicleInspectionProps {
  params?: Record<string, any>;
}

export const DAMAGE_TYPES = {
  PAINT_DAMAGE: "DAÑOS EN PINTURA",
  SCRATCH: "RALLADURA",
  DENT: "ABOLLADURA",
  BODY_DAMAGE: "DAÑOS DE CARROCERÍA",
} as const;

export type DamageType = (typeof DAMAGE_TYPES)[keyof typeof DAMAGE_TYPES];

export const DAMAGE_SYMBOLS = {
  [DAMAGE_TYPES.PAINT_DAMAGE]: "X",
  [DAMAGE_TYPES.SCRATCH]: "▲",
  [DAMAGE_TYPES.DENT]: "⭕",
  [DAMAGE_TYPES.BODY_DAMAGE]: "🏁",
} as const;

export const DAMAGE_COLORS = {
  [DAMAGE_TYPES.PAINT_DAMAGE]: "#ef4444",
  [DAMAGE_TYPES.SCRATCH]: "#f59e0b",
  [DAMAGE_TYPES.DENT]: "#252850",
  [DAMAGE_TYPES.BODY_DAMAGE]: "#1A388B",
} as const;
