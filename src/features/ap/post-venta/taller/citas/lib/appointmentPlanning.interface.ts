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
  // Orden de trabajo (Opcional)
  work_order_id?: string | null;
  work_order_correlative?: string | null;
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
  advisor_id?: string;
}

export interface getAppointmentPlanningProps {
  params?: Record<string, any>;
  enabled?: boolean;
}

// Interfaces para slots de tiempo disponibles
export interface TimeSlot {
  date: string;
  time: string;
  available: boolean;
  appointment_id?: number;
  type: "Reservación" | "Entrega" | "Ambos" | null;
  deliveries_count: number;
  advisor_id: number | null;
  advisor_name: string | null;
}

export interface AvailableSlotsResponse {
  date: string;
  slots: TimeSlot[];
}

export interface GetAvailableSlotsParams {
  start_date: string;
  end_date: string;
}

// Citas dentro del rango consultado para el reporte de calendario
// (endpoint available-slots-by-sede)
export interface CalendarAppointment {
  id: number;
  advisor_id: number | null;
  advisor_name: string | null;
  date_appointment: string;
  time_appointment: string;
  delivery_date: string;
  delivery_time: string;
  full_name_client: string;
  email_client: string;
  phone_client: string;
  plate: string;
  type_planning_id: number;
  type_planning: string;
  type_operation: string;
  description: string;
  is_taken: boolean;
  work_order_number: string | null;
}

export interface CalendarAppointmentsStatistics {
  total_taken: number;
  total_not_taken: number;
  percentage_taken: number;
  percentage_not_taken: number;
}

export interface CalendarAppointmentsByTypePlanning {
  type_planning_id: number;
  type_planning: string;
  count: number;
  percentage: number;
}

export interface CalendarAppointmentsResponse {
  sede_id: string;
  total: number;
  statistics: CalendarAppointmentsStatistics;
  consolidated_by_type_planning: CalendarAppointmentsByTypePlanning[];
  appointments: CalendarAppointment[];
}

export interface GetCalendarAppointmentsParams {
  start_date: string;
  end_date: string;
  sede_id: string | number;
  advisor_id?: string | number;
}
