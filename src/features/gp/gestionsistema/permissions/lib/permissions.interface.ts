import * as LucideReact from "lucide-react";
import { RoleResource } from "../../roles/lib/role.interface";

export type PermissionType = "view" | "create" | "edit" | "delete";

type IconNames = keyof typeof LucideReact | undefined;
export interface Permission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export interface View {
  id: string;
  name: string;
  permissions: Permission;
}

export interface SubModule {
  id: string;
  name: string;
  views: View[];
}

export interface Module {
  id: string;
  name: string;
  icon: any;
  color: string;
  subModules: SubModule[];
  views: View[];
}

export interface PermissionsFilters {
  searchTerm: string;
  selectedPermissionFilter: PermissionType | "all";
  showOnlyAssigned: boolean;
}

export interface ModuleResponse {
  modules: ModuleResource[];
  role: RoleResource;
}

export interface ModuleResource {
  id: number;
  parent_id: null;
  submodule: boolean;
  descripcion: string;
  company_id: number;
  ruta?: string;
  idPadre?: number;
  status_deleted: number;
  created_at: string;
  updated_at: string;
  creator_user?: number;
  updater_user?: number;
  icono: string;
  idSubPadre: null;
  idHijo: null;
  empresa_id: number;
  empresa_nombre: string;
  slug?: string;
  route?: string;
  icon?: IconNames;
  permissions: Permissions;
  children: ModuleResourceChild[];
}

export interface ModuleResourceChild {
  id: number;
  parent_id: number;
  submodule: boolean;
  descripcion: string;
  company_id: number;
  ruta: string;
  idPadre?: number;
  status_deleted: number;
  created_at: string;
  updated_at: string;
  creator_user?: number;
  updater_user?: number[];
  icono: string;
  idSubPadre: null | number | number;
  idHijo: null;
  empresa_id: number;
  empresa_nombre: string;
  slug?: string;
  route?: string;
  icon?: IconNames;
  permissions: Permissions;
  children: any[];
}

export interface Permissions {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

// Special Permissions Interfaces
export interface SpecialPermission {
  id: number;
  code: string;
  name: string;
  description: string;
  module: string;
  policy_method: string;
  type: string;
  is_active: boolean;
}

export interface GroupedSpecialPermissions {
  [module: string]: SpecialPermission[];
}

export interface SyncPermissionsRequest {
  role_id: number;
  permissions: number[];
}

// Permission Management Interfaces
export interface Permission {
  id: number;
  code: string;
  name: string;
  description: string;
  module: string;
  policy_method: string;
  is_active: boolean;
  is_assigned: boolean;
  action_label?: string;
  icon?: string;
}

export interface PermissionResponse {
  data: Permission[];
}

export interface BulkCreatePermissionRequest {
  vista_id: number;
  module: string;
  module_name: string;
  actions: string[];
  is_active: boolean;
}

export interface PermissionsFilters {
  search: string;
  module: string;
  type: string;
  is_active: boolean | null;
}
