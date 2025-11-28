import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";

export interface TypesOperationsAppointmentResponse {
  data: TypesOperationsAppointmentResource[];
  links: Links;
  meta: Meta;
}

export interface TypesOperationsAppointmentResource {
  id: number;
  code: string;
  description: string;
  type: string;
  status: boolean;
}

export interface TypesOperationsAppointmentRequest {
  code: string;
  description: string;
  type: string;
  status: boolean;
}

export interface getTypesOperationsAppointmentProps {
  params?: Record<string, any>;
}
