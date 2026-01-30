import { VehicleResource } from "@/features/ap/comercial/vehiculos/lib/vehicles.interface";
import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";

export interface AppointmentPlanningResponse {
  data: AppointmentPlanningResource[];
  links: Links;
  meta: Meta;
}

export interface AppointmentPlanningResource {
  id: number;
  description: string;
  delivery_date: string;
  delivery_time: string;
  date_appointment: string;
  time_appointment: string;
  num_doc_client: string;
  full_name_client: string;
  email_client: string;
  phone_client: string;
  type_operation_appointment_id: number;
  type_planning_id: number;
  type_planning_name: string;
  type_operation_appointment_name: string;
  ap_vehicle_id: number;
  vehicle: VehicleResource;
  advisor_id: number;
  sede_id: number;
  sede_name: string;
  plate: string;
  is_taken: boolean;
}

export interface AppointmentPlanningRequest {
  description: string;
  delivery_date: string;
  delivery_time: string;
  date_appointment: string;
  time_appointment: string;
  full_name_client: string;
  email_client: string;
  phone_client: string;
  type_operation_appointment_id: string;
  type_planning_id: string;
  ap_vehicle_id: string;
}

export interface getAppointmentPlanningProps {
  params?: Record<string, any>;
}

// Interfaces para slots de tiempo disponibles
export interface TimeSlot {
  date: string;
  time: string;
  available: boolean;
  appointment_id?: number;
  type: string;
  advisor_id: number;
  advisor_name: string;
}

export interface AvailableSlotsResponse {
  date: string;
  slots: TimeSlot[];
}

export interface GetAvailableSlotsParams {
  start_date: string;
  end_date: string;
}
