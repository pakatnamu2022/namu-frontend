import { Links, Meta } from "@/shared/lib/pagination.interface";

export interface IncomeSectorResponse {
  data: IncomeSectorResource[];
  links: Links;
  meta: Meta;
}

export interface IncomeSectorResource {
  id: number;
  description: string;
  type: string;
  status: boolean;
}

export interface IncomeSectorRequest {
  description: string;
  type: string;
  status: boolean;
}

export interface getIncomeSectorProps {
  params?: Record<string, any>;
}
