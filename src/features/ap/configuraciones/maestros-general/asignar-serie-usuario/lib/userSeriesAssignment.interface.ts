import { Links, Meta } from "@/shared/lib/pagination.interface";

export interface UserSeriesAssignmentResponse {
  data: UserSeriesAssignmentResource[];
  links: Links;
  meta: Meta;
}

export interface UserSeriesAssignmentResource {
  worker_id: string;
  vouchers: VouchersResource[];
}

export interface UserSeriesAssignmentRequest {
  worker_id: string;
  vouchers: [];
}

export interface getUserSeriesAssignmentProps {
  params?: Record<string, any>;
}

export interface VouchersResource {
  id: number;
  series: string;
  sede: string;
  type_receipt: string;
  type_operation: string;
}
