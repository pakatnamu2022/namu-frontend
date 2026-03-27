import { Links, Meta } from "@/shared/lib/pagination.interface";

export interface ReportByPeriodsFilters {
  sede_id: string;
  area_id: string;
  cargo: string;
  categoria: string;
  dni: string;
  nombre: string;
}

export interface ReportByPeriodsRequest {
  evaluaciones_id: number[];
  filters: {
    sede_id: number | null;
    area_id: number | null;
    cargo: string | null;
    categoria: string | null;
    dni: string | null;
    nombre: string | null;
  };
  page?: number;
  per_page?: number;
}

export interface ReportByPeriodsRow {
  person_id: number;
  apellido?: string;
  nombre?: string;
  dni?: string;
  cargo?: string;
  categoria?: string;
  [key: string]: unknown;
}

export interface ReportByPeriodsApiResponse {
  data: ReportByPeriodsRow[];
  links?: Links;
  meta?: Meta;
}

export interface ReportByPeriodsResponse {
  rows: ReportByPeriodsRow[];
  total: number;
  lastPage: number;
  currentPage: number;
}
