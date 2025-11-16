import { Links, Meta } from "@/src/shared/lib/pagination.interface";

export interface AssignSalesSeriesResponse {
  data: AssignSalesSeriesResource[];
  links: Links;
  meta: Meta;
}

export interface AssignSalesSeriesResource {
  id: number;
  series: string;
  correlative_start: number;
  type_receipt_id: number;
  type_operation_id: number;
  sede_id: number;
  sede?: string;
  type_receipt?: string;
  type_operation?: string;
  status: boolean;
}

export interface AssignSalesSeriesRequest {
  series: string;
  correlative_start: number;
  type_receipt_id: number;
  type_operation_id: number;
  sede_id: number;
  status: boolean;
}

export interface getAssignSalesSeriesProps {
  params?: Record<string, any>;
}
