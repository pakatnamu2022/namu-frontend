import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface ModelsVnResponse {
  data: ModelsVnResource[];
  links: Links;
  meta: Meta;
}

export interface ModelsVnResource {
  id: number;
  code: string;
  version: string;
  power: string;
  model_year: number;
  wheelbase: string;
  axles_number: string;
  width: string;
  length: string;
  height: string;
  seats_number: string;
  doors_number: string;
  net_weight: string;
  gross_weight: string;
  payload: string;
  displacement: string;
  cylinders_number: string;
  passengers_number: string;
  wheels_number: string;
  distributor_price: number;
  transport_cost: number;
  other_amounts: number;
  purchase_discount: number;
  igv_amount: number;
  total_purchase_excl_igv: number;
  total_purchase_incl_igv: number;
  sale_price: number;
  margin: number;
  brand_id: number;
  brand: string;
  family_id: number;
  family: string;
  class_id: number;
  class: string;
  class_dyn: string;
  marca_dyn: string;
  family_dyn: string;
  fuel_id: number;
  fuel: string;
  vehicle_type_id: number;
  vehicle_type: string;
  body_type_id: number;
  body_type: string;
  traction_type_id: number;
  traction_type: string;
  transmission_id: number;
  transmission: string;
  currency_type_id: number;
  status: boolean;
  currency_type?: string;
  currency_symbol?: string;
  type_operation_id: number;
}

export interface ModelsVnRequest {
  code: string;
  version: string;
  power: string;
  model_year: number;
  wheelbase: string;
  axles_number: string;
  width: string;
  length: string;
  height: string;
  seats_number: string;
  doors_number: string;
  net_weight: string;
  gross_weight: string;
  payload: string;
  displacement: string;
  cylinders_number: string;
  passengers_number: string;
  wheels_number: string;
  distributor_price: number;
  transport_cost: number;
  other_amounts: number;
  purchase_discount: number;
  igv_amount: number;
  total_purchase_excl_igv: number;
  total_purchase_incl_igv: number;
  sale_price: number;
  margin: number;
}

export interface getModelsVnProps {
  params?: Record<string, any>;
}
