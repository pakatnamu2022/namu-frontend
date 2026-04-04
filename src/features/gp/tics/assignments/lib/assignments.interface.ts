import { type Links, type Meta } from "@/shared/lib/pagination.interface";
import {
  EquipmentAssignmentResource,
  EquipmentAssignmentRequest,
} from "@/features/gp/tics/equipment/lib/equipment.interface";
import { PhoneLineWorkerResource } from "@/features/gp/tics/phoneLine/lib/phoneLine.interface";

export type { EquipmentAssignmentResource, EquipmentAssignmentRequest };
export type { PhoneLineWorkerResource };

export type AssignmentType = "equipment" | "phoneLine";

export interface EquipmentAssignmentListResponse {
  data: EquipmentAssignmentResource[];
  links: Links;
  meta: Meta;
}

export interface PhoneLineAssignmentListResponse {
  data: PhoneLineWorkerResource[];
  links: Links;
  meta: Meta;
}

export interface PhoneLineAssignmentRequest {
  phone_line_id: number;
  worker_id: number;
  equipo_id?: number;
}

export interface BulkEquipmentAssignFormValues {
  worker_id: string;
  fecha: string;
  observacion: string;
  items: {
    equipo_id: string;
    observacion: string;
  }[];
}

export interface PhoneLineAssignFormValues {
  phone_line_id: string;
  worker_id: string;
  equipo_id: string;
}

export interface PhoneLineUnassignRequest {
  unassigned_at: string;
  observacion_unassign: string;
}

export interface LinkEquipmentRequest {
  equipo_id: number | null;
}

export interface LinkPhoneLineRequest {
  phone_line_id: number | null;
}
