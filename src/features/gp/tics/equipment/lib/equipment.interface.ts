import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface EquipmentResponse {
  data: EquipmentResource[];
  links: Links;
  meta: Meta;
}

export interface EquipmentResource {
  id: number;
  equipo: string;
  tipo_equipo: string;
  marca_modelo: string;
  marca: string;
  modelo: string;
  serie: string;
  status: string;
  estado_uso: string;
  detalle: string;
  sede: string;
  empresa: string;
  ram?: string;
  almacenamiento: string;
  procesador?: string;
  stock_actual?: string;
  pertenece_sede: number;
  tipo_equipo_id: number;
  sede_id: number;
  status_id: number;
  status_deleted: number;
  tipo_adquisicion?: string;
  factura?: string;
  contrato?: string;
  proveedor?: string;
  fecha_adquisicion?: string;
  fecha_garantia?: string;
}

export interface EquipmentRequest {
  marca: string;
  modelo: string;
  tipo_equipo_id: string;
  serie: string;
  detalle: string;
  ram: string;
  almacenamiento: string;
  procesador: string;
  stock_actual: number;
  estado_uso: "NUEVO" | "USADO" | undefined;
  sede_id: string;
  pertenece_sede: boolean;
  fecha_adquisicion?: string;
  fecha_garantia?: string;
  tipo_adquisicion: string;
  factura: string;
  contrato: string;
  proveedor: string;
}

export interface getEquipmentsProps {
  params?: Record<string, any>;
}

export interface EquipmentAssignmentResource {
  id: number;
  persona_id: number;
  worker_name: string;
  fecha: string;
  status_id: number;
  status_deleted: number;
  write_id: null | number;
  conformidad: number;
  fecha_conformidad?: string;
  unassigned_at?: string;
  observacion?: string;
  observacion_unassign?: string;
  pdf_path?: string;
  pdf_unassign_path?: string;
  items: EquipmentAssignmentItemResource[];
  created_at: string;
  updated_at: string;
}

export interface EquipmentAssignmentItemResource {
  id: number;
  asig_equipo_id: number;
  equipo_id: number;
  equipment: Equipment;
  observacion?: string;
  status_id: null | number;
  observacion_dev?: string;
  created_at: string;
  updated_at: string;
}

export interface Equipment {
  id: number;
  equipo: string;
  marca?: string;
  modelo?: string;
  serie: string;
  tipo_equipo_id: number;
  equipment_type: string;
}

export interface EquipmentAssignmentRequest {
  persona_id: number;
  fecha: string;
  observacion: string;
  items: {
    equipo_id: number;
    observacion: string;
  }[];
}

export interface EquipmentUnassignRequest {
  observacion_unassign: string;
  fecha: string;
}
