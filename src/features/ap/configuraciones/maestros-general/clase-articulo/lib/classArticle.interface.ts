import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface ClassArticleResponse {
  data: ClassArticleResource[];
  links: Links;
  meta: Meta;
}

export interface ClassArticleResource {
  id: number;
  dyn_code: string;
  description: string;
  account: string;
  type: string;
  status: boolean;
}

export interface ClassArticleRequest {
  dyn_code: string;
  description: string;
  account: string;
  type: string;
  status: boolean;
}

export interface getClassArticleProps {
  params?: Record<string, any>;
}
