import { Links, Meta } from "@/shared/lib/pagination.interface";

export interface SedeResponse {
  data: SedeResource[];
  links: Links;
  meta: Meta;
}

export interface SedeResource {
  id: number;
  localidad: null | string;
  suc_abrev: string;
  description: string;
  abreviatura: string;
  empresa_id: null | number;
  ruc: null | string;
  razon_social: null | string;
  direccion: null | string;
  distrito: null | string;
  provincia: null | string;
  departamento: null | string;
  web: null | string;
  email: null | string;
  logo: null;
  ciudad: null | string;
  info_labores: null | string;
  dyn_code: null | string;
  establishment: null | string;
  district_id: null | number;
  province_id: null | number;
  department_id: null | number;
  status: boolean;
}

export interface getSedesProps {
  params?: Record<string, any>;
}
