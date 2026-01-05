import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface UserResponse {
  data: UserResource[];
  links: Links;
  meta: Meta;
}

export interface UserResource {
  id: number;
  partner_id: number;
  name: string;
  username: string;
  email: string;
  foto_adjunto: string;
  position: string;
  empresa: string;
  sede: string;
  sede_id: number;
  shop_id: number;
  fecha_ingreso: string;
  role?: string;
}

export interface UserCompleteResource {
  id: number;
  partner_id: number;
  username: string;
  role: string;
  name: string;
  document: string;
  license?: string;
  passport?: string;
  hazmat_license: string;
  license_class: string;
  license_category: string;
  birth_date: string;
  nationality: string;
  gender: string;
  education?: string;
  ubigeo: string;
  personal_email: string;
  personal_phone: string;
  reference_phone?: string;
  home_phone?: string;
  address: string;
  address_reference: string;
  district: string;
  province: string;
  department: string;
  children_count: number;
  birthplace: string;
  marital_status: string;
  primary_school: string;
  primary_school_status: string;
  secondary_school: string;
  secondary_school_status: string;
  technical_university: string;
  career: string;
  study_city: string;
  highest_degree: string;
  study_cycle: string;
  study_years?: string;
  degree_obtained: string;
  cv_file?: string;
  cv_last_update?: string;
  company: string;
  branch: string;
  position: string;
  start_date: string;
  photo: string;
}

export interface UserRequest {
  id: number;
  submodule: boolean;
  descripcion: string;
  route: string;
  ruta: string;
  icono: string;
  icon: string;
  parent_id: number;
  company_id: number;
  idPadre: number;
  idSubPadre: string;
  idHijo: string;
}

export interface getUsersProps {
  params?: Record<string, any>;
}

export interface UserSedeResource {
  id: string;
  user_id: string;
  sede_id: string;
  status: string;
  user: UserResource;
  sede: SedeResource;
}

export interface SedeResource {
  id: string;
  localidad: string;
  suc_abrev: string;
  description: string;
  abreviatura: string;
  empresa_id: string;
  company: string;
  ruc: string;
  razon_social: string;
  direccion: string;
  distrito: string;
  provincia: string;
  departamento: string;
  web: string;
  email: string;
  logo: string;
  ciudad: string;
  info_labores: string;
  dyn_code: string;
  establishment: string;
  department_id: string;
  department: string;
  province_id: string;
  province: string;
  district_id: string;
  district: string;
  status: string;
}

export interface StoreUserSedesRequest {
  user_id: number;
  sede_ids: number[];
}
