import { Links, Meta } from "@/shared/lib/pagination.interface";
import { Permission } from "../../permissions/lib/permissions.interface";

export interface ViewResponse {
  data: ViewResource[];
  links: Links;
  meta: Meta;
}

export interface ViewResource {
  id: number;
  submodule: boolean;
  descripcion: string;
  slug: string;
  route: string;
  ruta: string;
  icono: string;
  icon: string;
  parent: string;
  company: string;
  padre: string;
  subPadre: string;
  hijo: string;
  parent_id: number;
  company_id: number;
  idPadre: number;
  idSubPadre: number;
  idHijo: number;
}

export interface ViewRequest {
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

export interface getViewsProps {
  params?: Record<string, any>;
}

export interface ViewPermissionResponse {
  current_page: number;
  data: View[];
  from: number;
  last_page: number;
  path: string;
  per_page: number;
  prev_page_url: null;
  to: number;
  total: number;
}

export interface View {
  id: number;
  descripcion: string;
  slug: null | string;
  route: null | string;
  icon: null | string;
  parent_id: number | null;
  company: string | null;
  padre: string | null;
  subPadre: string | null;
  hijo: string | null;
  permissions: Permission[];
}
