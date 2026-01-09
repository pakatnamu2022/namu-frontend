import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface SedeResponse {
  data: SedeResource[];
  links: Links;
  meta: Meta;
}

export interface SedeResource {
  id: number;
  localidad?: string;
  suc_abrev: string;
  description: string;
  abreviatura: string;
  empresa_id?: number;
  ruc?: string;
  razon_social?: string;
  direccion?: string;
  distrito?: string;
  provincia?: string;
  departamento?: string;
  web?: string;
  email?: string;
  logo: null;
  ciudad?: string;
  info_labores?: string;
  dyn_code?: string;
  establishment?: string;
  district_id?: number;
  province_id?: number;
  department_id?: number;
  shop_id?: number;
  status: boolean;
  has_workshop: boolean;
}

export interface getSedesProps {
  params?: Record<string, any>;
}
