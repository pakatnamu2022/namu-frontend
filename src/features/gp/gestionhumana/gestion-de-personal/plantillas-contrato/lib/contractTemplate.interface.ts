import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";

export interface ContractTemplateResponse {
  data: ContractTemplateResource[];
  links: Links;
  meta: Meta;
}

export interface ContractTemplateResource {
  id: number;
  nombre: string;
  descripcion: string | null;
  contenido: string;
  created_at?: string;
  updated_at?: string;
}

export interface getContractTemplatesProps {
  params?: Record<string, any>;
}
