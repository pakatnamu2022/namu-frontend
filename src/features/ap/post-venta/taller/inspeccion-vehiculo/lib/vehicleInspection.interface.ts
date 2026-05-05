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
  // Detalles de trabajo
  oil_change: boolean;
  check_level_lights: boolean;
  general_lubrication: boolean;
  rotation_inspection_cleaning: boolean;
  insp_filter_basic_checks: boolean;
  tire_pressure_inflation_check: boolean;
  alignment_balancing: boolean;
  pad_replace_disc_resurface: boolean;
  other_work_details: string | null;
  // Requerimiento del cliente
  customer_requirement: string | null;
  // Explicación de resultados
  explanation_work_performed: boolean;
  price_explanation: boolean;
  confirm_additional_work: boolean;
  clarification_customer_concerns: boolean;
  exterior_cleaning: boolean;
  interior_cleaning: boolean;
  keeps_spare_parts: boolean;
  valuable_objects: boolean;
  // Items de cortesía
  courtesy_seat_cover: boolean;
  paper_floor: boolean;
  general_observations: string | null;
  inspected_by: number;
  inspected_by_name: string;
  inspection_date: string | Date;
  customer_signature_url: string;
  signed_by: {
    signer_type: string;
    name: string;
    num_doc: string;
  };
  washed: boolean;
  photo_front_url: string;
  photo_back_url: string;
  photo_left_url: string;
  photo_right_url: string;
  photo_optional_1_url: string;
  photo_optional_2_url: string;
  photo_optional_3_url: string;
  photo_optional_4_url: string;
  photo_optional_5_url: string;
  photo_optional_6_url: string;
  damages?: VehicleInspectionDamageResource[];
  // Cancellation fields
  is_cancelled?: boolean;
  cancellation_requested_by?: number | null;
  cancellation_requested_by_name?: string | null;
  cancellation_confirmed_by?: number | null;
  cancellation_confirmed_by_name?: string | null;
  cancellation_requested_at?: string | null;
  cancellation_confirmed_at?: string | null;
  cancellation_reason?: string | null;
  // Campos de vehículo (desde la orden de trabajo)
  vehicle_id?: number;
  vehicle_plate?: string;
  vehicle_vin?: string;
  vehicle_model?: string;
  vehicle_brand?: string;
  vehicle_year?: string;
  vehicle_color?: string;
  work_order_correlative?: string;
  ap_work_order_id?: number;
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
  ap_work_order_id: string;
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
  photo_optional_1?: File | null;
  photo_optional_2?: File | null;
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
  HEADLIGHT_DAMAGE: "DAÑOS EN FAROS",
} as const;

export type DamageType = (typeof DAMAGE_TYPES)[keyof typeof DAMAGE_TYPES];

export const DAMAGE_SYMBOLS = {
  [DAMAGE_TYPES.PAINT_DAMAGE]: "X",
  [DAMAGE_TYPES.SCRATCH]: "▲",
  [DAMAGE_TYPES.DENT]: "⭕",
  [DAMAGE_TYPES.BODY_DAMAGE]: "🏁",
  [DAMAGE_TYPES.HEADLIGHT_DAMAGE]: "💡",
} as const;

export const DAMAGE_COLORS = {
  [DAMAGE_TYPES.PAINT_DAMAGE]: "#ef4444",
  [DAMAGE_TYPES.SCRATCH]: "#f59e0b",
  [DAMAGE_TYPES.DENT]: "#252850",
  [DAMAGE_TYPES.BODY_DAMAGE]: "#1A388B",
  [DAMAGE_TYPES.HEADLIGHT_DAMAGE]: "#16a34a",
} as const;
