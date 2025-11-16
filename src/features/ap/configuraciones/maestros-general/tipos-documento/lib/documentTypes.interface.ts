import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface DocumentTypeResponse {
  data: DocumentTypeResource[];
  links: Links;
  meta: Meta;
}

export interface DocumentTypeResource {
  id: number;
  code: string;
  description: string;
  type: string;
  status: boolean;
}

export interface DocumentTypeRequest {
  code: string;
  description: string;
  type: string;
  status: boolean;
}

export interface getDocumentTypeProps {
  params?: Record<string, any>;
}
