import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";

export interface CampaignScheduleResponse {
  data: CampaignScheduleResource[];
  links: Links;
  meta: Meta;
}

export interface CampaignScheduleResource {
  id: number;
  sede_id: number;
  sede: {
    id: number;
    name: string;
    abreviatura: string;
  };
  worker_id: number;
  worker: {
    id: number;
    nombre_completo: string;
    num_doc: string;
  };
  date: string;
  created_by: number;
  creator?: {
    id: number;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

export interface CampaignScheduleRequest {
  sede_id: number;
  worker_id: number;
  dates: string[];
}

export interface CampaignScheduleStoreResponse {
  message: string;
  data: CampaignScheduleResource[];
}

export interface WorkerScheduleDate {
  id: number;
  date: string;
  sede_id: number;
  sede_name: string;
}

export interface WorkerScheduleResponse {
  worker_id: number;
  dates: WorkerScheduleDate[];
}

export interface GetWorkerScheduleParams {
  worker_id: number | string;
  start_date: string;
  end_date: string;
}

export interface getCampaignScheduleProps {
  params?: Record<string, any>;
  enabled?: boolean;
}
