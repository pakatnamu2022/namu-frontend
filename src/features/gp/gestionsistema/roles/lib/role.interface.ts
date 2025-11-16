import { Links, Meta } from "@/shared/lib/pagination.interface";

export interface RoleResponse {
  data: RoleResource[];
  links: Links;
  meta: Meta;
}

export interface RoleResource {
  id: number;
  nombre: string;
  descripcion: string;
  users: number;
}

export interface RoleRequest {
  nombre: string;
  descripcion: string;
}

export interface getRolesProps {
  params?: Record<string, any>;
}
