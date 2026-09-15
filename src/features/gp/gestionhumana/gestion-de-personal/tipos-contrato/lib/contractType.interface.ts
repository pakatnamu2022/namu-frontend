import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";

export interface ContractTypeResponse {
  data: ContractTypeResource[];
  links: Links;
  meta: Meta;
}

export interface ContractTypeResource {
  id: number;
  descripcion: string;
  anios: number | null;
  dias_vacaciones: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface getContractTypesProps {
  params?: Record<string, any>;
}
