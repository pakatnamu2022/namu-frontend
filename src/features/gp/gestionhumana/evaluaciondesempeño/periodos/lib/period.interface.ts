import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export interface PeriodResponse {
  data: PeriodResource[];
  links: Links;
  meta: Meta;
}

export interface PeriodResource {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  active: boolean;
}

export interface getPeriodsProps {
  params?: Record<string, any>;
}
