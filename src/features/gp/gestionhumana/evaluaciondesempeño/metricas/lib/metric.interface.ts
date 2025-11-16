import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface MetricResponse {
  data: MetricResource[];
  links: Links;
  meta: Meta;
}

export interface MetricResource {
  id: number;
  name: string;
  description?: string;
}

export interface getMetricsProps {
  params?: Record<string, any>;
}
