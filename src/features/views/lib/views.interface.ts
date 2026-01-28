import * as LucideReact from "lucide-react";

type IconNames = keyof typeof LucideReact | undefined;

export interface ViewsResponse {
  opcionesMenu: ViewsResponseOpcionesMenu[];
}

export interface ViewsResponseOpcionesMenu {
  empresa_id: number;
  empresa_nombre: string;
  empresa_abreviatura: string;
  menu: ViewsResponseMenu[];
}

export interface ViewsResponseMenu {
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
  children: ViewsResponseMenuChild[];
}

export interface ViewsResponseMenuChild {
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
  children: ViewsResponseMenuChild[];
}
