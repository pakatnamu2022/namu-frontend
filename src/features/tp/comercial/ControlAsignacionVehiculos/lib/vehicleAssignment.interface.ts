import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface VehicleAssignmentControlResponse {
  data: VehicleAssignmentControlResource[];
  links: Links;
  meta: Meta;
}

export interface VehicleAssignmentControlResource {
  id: number;
  tracto_id: number;
  tractor: string;
  driver_id: number;
  driver: string;
  status_deleted: number;
}

export interface getVehicleAssignmentControlProps {
  params?: Record<string, any>;
}
