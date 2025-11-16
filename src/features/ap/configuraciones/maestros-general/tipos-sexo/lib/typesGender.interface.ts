import { Links, Meta } from "@/src/shared/lib/pagination.interface";

export interface TypeGenderResponse {
  data: TypeGenderResource[];
  links: Links;
  meta: Meta;
}

export interface TypeGenderResource {
  id: number;
  description: string;
  type: string;
  status: boolean;
}

export interface TypeGenderRequest {
  description: string;
  type: string;
  status: boolean;
}

export interface getTypeGenderProps {
  params?: Record<string, any>;
}
