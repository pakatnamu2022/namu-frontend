import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";

export interface InternalNoteMigrationResponse {
  data: InternalNoteMigrationResource[];
  links: Links;
  meta: Meta;
}

export interface InternalNoteMigrationResource {
  id: number;
  number: string;
  work_order_id: number;
  work_order_correlative?: string;
  created_date: string;
  closed_date: string | null;
  status: "pending" | "invoiced";
  accounting_status?: string;
  migration_verified_at?: string | null;
  dyn_series_out?: string | null;
  dyn_series_in?: string | null;
  is_accounted_out?: boolean;
  is_accounted_in?: boolean;
  migration_status: string;
  created_at: string;
  updated_at: string;
}

export interface getInternalNoteMigrationProps {
  params?: Record<string, any>;
  enabled?: boolean;
}
