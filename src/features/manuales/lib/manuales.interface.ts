export interface ManualResource {
  id: number;
  company_slug: string;
  module_slug: string;
  title: string;
  description: string | null;
  s3_url: string;
  order: number;
  created_at: string;
}

export interface getManualesProps {
  company: string;
  module: string;
}
