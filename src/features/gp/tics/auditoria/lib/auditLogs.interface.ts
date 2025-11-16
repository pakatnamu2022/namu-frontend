import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface AuditLogsResponse {
  data: AuditLogsResource[];
  links: Links;
  meta: Meta;
}

export interface AuditLogsResource {
  id: number;
  user_id: number | null;
  user_name: string | null;
  user_email: string | null;
  auditable_type: string;
  auditable_id: number;
  model_name: string;
  action: string;
  action_description: string;
  old_values: any | null;
  new_values: string | null;
  changed_fields: any | null;
  changes_summary: string[] | null;
  ip_address: string | null;
  user_agent: string | null;
  url: string | null;
  method: string | null;
  request_data: any | null;
  description: string | null;
  metadata: any | null;
  created_at: string;
}

export interface getAuditLogsProps {
  params?: Record<string, any>;
}
