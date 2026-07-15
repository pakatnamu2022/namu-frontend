import { type Links, type Meta } from "@/shared/lib/pagination.interface";
import { ShipmentsReceptionsResource } from "../../envios-recepciones/lib/shipmentsReceptions.interface";
import { VehicleResource } from "../../vehiculos/lib/vehicles.interface";

export interface VehiclesDeliveryResponse {
  data: VehiclesDeliveryResource[];
  links: Links;
  meta: Meta;
}

export type WashStatus = "pending" | "completed";
export type DeliveryStatus = "pending" | "delivered" | "completed";
export type ChecklistStatus = "draft" | "confirmed" | "completed";

export interface VehiclesDeliveryResource {
  id: number;
  vehicle_id: number;
  vehicle: VehicleResource;
  vin?: string;
  scheduled_delivery_date: string | Date;
  real_delivery_date?: string | null;
  wash_date: string | Date;
  observations: string;
  advisor_id: number;
  advisor_name?: string;
  sede_id?: number;
  sede_name?: string;
  status_wash: WashStatus;
  status_delivery?: DeliveryStatus;
  is_accounted: boolean;
  client_name?: string;
  shipping_guide_id?: number;
  aceptada_por_sunat?: boolean | null;
  status_dynamic?: number | null;
  sent_at?: string | null;
  checklist_status?: ChecklistStatus | null;
  shipping_guide?: ShipmentsReceptionsResource | null;
  is_extraordinary?: boolean;
  extraordinary_approved?: boolean | null;
  extraordinary_approved_at?: string | null;
  extraordinary_sent_by?: number | null;
  rescheduled_by?: number | null;
}

export interface AvailableDeliverySlot {
  time: string;
  datetime: string;
  available: boolean;
}

export interface AvailableDeliverySlotsResponse {
  date: string;
  slots: AvailableDeliverySlot[];
}

export interface VehiclesDeliveryRequest {
  advisor_id: string;
  vehicle_id: string;
  scheduled_delivery_date: string | Date;
  wash_date: string | Date;
  observations: string;
}

export interface getVehiclesDeliveryProps {
  params?: Record<string, any>;
}

export interface DeliveryChecklistItemResource {
  id: number | null;
  source: "reception" | "purchase_order" | "manual";
  source_id?: number | null;
  description: string;
  quantity: string;
  unit?: string | null;
  is_confirmed: boolean;
  observations?: string | null;
  sort_order: number;
}

export interface DeliveryChecklistResource {
  id: number | null;
  vehicle_delivery_id: number;
  observations?: string | null;
  status: "draft" | "confirmed";
  confirmed_at?: string | null;
  confirmed_by?: number | null;
  confirmed_by_name?: string | null;
  items: DeliveryChecklistItemResource[];
}

export type DiagnoseVinCheckStatus = "pass" | "fail" | "warning";

export interface DiagnoseVinCheck {
  step: string;
  status: DiagnoseVinCheckStatus;
  message: string;
  action?: string | null;
}

export interface DiagnoseVinVehicle {
  id: number;
  vin: string;
  status: string;
  warehouse: string;
  sede: string;
}

export interface DiagnoseVinData {
  can_generate_delivery: boolean;
  vehicle?: DiagnoseVinVehicle | null;
  checks: DiagnoseVinCheck[];
}

// El endpoint devuelve el diagnóstico directamente (sin envolver en { data }).
// Cuando el VIN no existe, en su lugar responde { success: false, message }.
export type DiagnoseVinResponse =
  | (DiagnoseVinData & { success?: true })
  | { success: false; message: string };
