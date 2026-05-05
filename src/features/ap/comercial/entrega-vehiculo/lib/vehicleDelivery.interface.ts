import { type Links, type Meta } from "@/shared/lib/pagination.interface";
import { ShipmentsReceptionsResource } from "../../envios-recepciones/lib/shipmentsReceptions.interface";

export interface VehiclesDeliveryResponse {
  data: VehiclesDeliveryResource[];
  links: Links;
  meta: Meta;
}

export interface VehiclesDeliveryResource {
  id: number;
  vehicle_id: number;
  vin?: string;
  scheduled_delivery_date: string | Date;
  wash_date: string | Date;
  observations: string;
  advisor_id: number;
  advisor_name?: string;
  sede_id?: number;
  sede_name?: string;
  status_wash: string;
  status_delivery?: string;
  client_name?: string;
  shipping_guide_id?: number;
  aceptada_por_sunat?: boolean | null;
  status_dynamic?: string | null;
  sent_at?: string | null;
  checklist_status?: "draft" | "confirmed" | null;
  shipping_guide?: ShipmentsReceptionsResource | null;
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
