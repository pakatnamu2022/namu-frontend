import { Links, Meta } from "@/shared/lib/pagination.interface";

export interface SupplierOrderTypeResponse {
  data: SupplierOrderTypeResource[];
  links: Links;
  meta: Meta;
}

export interface SupplierOrderTypeResource {
  id: number;
  code: string;
  description: string;
  type: string;
  status: boolean;
}

export interface SupplierOrderTypeRequest {
  code: string;
  description: string;
  type: string;
  status: boolean;
}

export interface getSupplierOrderTypeProps {
  params?: Record<string, any>;
}
