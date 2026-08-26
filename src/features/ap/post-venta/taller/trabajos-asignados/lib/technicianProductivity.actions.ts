import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import {
  TechnicianProductivityFilters,
  TechnicianProductivityResponse,
} from "./technicianProductivity.interface";

const DETAIL_ENDPOINT =
  "/ap/postVenta/dashboard/technician-productivity-detail";

export async function getTechnicianProductivityDetail(
  filters: TechnicianProductivityFilters,
): Promise<TechnicianProductivityResponse> {
  const config: AxiosRequestConfig = {
    params: {
      worker_id: filters.worker_id,
      date_range: filters.date_range,
      ...(filters.sede_id && { sede_id: filters.sede_id }),
    },
  };

  const { data } = await api.get<TechnicianProductivityResponse>(
    DETAIL_ENDPOINT,
    config,
  );
  return data;
}
