import { Links, Meta } from "@/shared/lib/pagination.interface";

export interface ParameterResponse {
  data: ParameterResource[];
  links: Links;
  meta: Meta;
}

export interface ParameterResource {
  id: number;
  name: string;
  type: string;
  isPercentage: boolean;
  details: Detail[];
}

interface Detail {
  id: number;
  label: string;
  from: number;
  to: number;
  parameter_id: number;
}

export interface getParametersProps {
  params?: Record<string, any>;
}
