import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface EquipmentTypeResponse {
  data: EquipmentTypeResource[];
  links: Links;
  meta: Meta;
}

export interface EquipmentTypeResource {
  id: number;
  name: string;
}

export interface EquipmentTypeRequest {
  name: string;
}

export interface getEquipmentTypesProps {
  params?: Record<string, any>;
}
