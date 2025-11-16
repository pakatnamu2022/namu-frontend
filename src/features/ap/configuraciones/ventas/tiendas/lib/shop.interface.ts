import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface ShopResponse {
  data: ShopResource[];
  links: Links;
  meta: Meta;
}

export interface ShopResource {
  id: number;
  description: string;
  type: string;
  sedes: ShopSedeResource[];
  status: boolean;
}

export interface ShopSedeResource {
  id: number;
  abreviatura: string;
}

export interface ShopRequest {
  description: string;
  type: string;
  status: boolean;
}

export interface getShopProps {
  params?: Record<string, any>;
}
