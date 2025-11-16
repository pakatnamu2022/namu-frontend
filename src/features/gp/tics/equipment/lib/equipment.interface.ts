import { Links, Meta } from "@/shared/lib/pagination.interface";

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
  ram: null | string;
  almacenamiento: string;
  procesador: null | string;
  stock_actual: null;
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

export interface getEquipmentsProps {
  params?: Record<string, any>;
}
