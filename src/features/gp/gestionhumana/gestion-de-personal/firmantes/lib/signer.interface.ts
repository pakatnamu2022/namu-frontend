import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";

export interface SignerResponse {
  data: SignerResource[];
  links: Links;
  meta: Meta;
}

export interface SignerResource {
  id: number;
  nombre: string;
  persona_id: number | null;
  worker_name?: string;
  sucursal_id: number | null;
  sede_abreviatura?: string;
  has_certificate: boolean;
  has_key: boolean;
  has_firmaimg: boolean;
  fecha_vencimiento: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface getSignersProps {
  params?: Record<string, any>;
}
