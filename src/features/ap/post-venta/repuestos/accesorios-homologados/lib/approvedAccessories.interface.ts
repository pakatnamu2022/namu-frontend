import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";

export interface ApprovedAccesoriesResponse {
  data: ApprovedAccesoriesResource[];
  links: Links;
  meta: Meta;
}

export interface ApprovedAccessoryPriceResource {
  id?: number;
  body_type_id: number;
  body_type?: string;
  body_type_code?: string;
  price: number;
}

export interface ApprovedAccesoriesResource {
  id: number;
  code: string;
  type_operation_id: number;
  type_operation: string;
  description: string;
  status: boolean;
  type_currency_id: number;
  type_currency?: string;
  currency_symbol?: string;
  prices: ApprovedAccessoryPriceResource[];
  body_type_ids: number[];
  /**
   * Precio efectivo para la carrocería en contexto. No viene del API: lo calcula
   * la solicitud de compra según el modelo/VIN seleccionado antes de pasar el
   * accesorio a las tablas del cotizador.
   */
  price?: number;
}

export interface ApprovedAccesoriesRequest {
  type_operation_id: number;
  description: string;
  status: boolean;
  prices: { body_type_id: number; price: number }[];
}

export interface getApprovedAccesoriesProps {
  params?: Record<string, any>;
}
