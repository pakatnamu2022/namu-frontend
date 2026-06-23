import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface ManualResponse {
  data: ManualResource[];
  links: Links;
  meta: Meta;
}

export interface ManualResource {
  id: number;
  vista_id: number;
  company_slug: string;
  module_slug: string;
  title: string;
  description: string | null;
  s3_url: string;
  order: number;
  created_at: string;
}

export interface getManualsAdminProps {
  params?: Record<string, any>;
}
