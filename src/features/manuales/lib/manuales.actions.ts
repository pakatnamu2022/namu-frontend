import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { ManualResource, getManualesProps } from "./manuales.interface";
import { MANUALS } from "./manuales.constants";

interface ManualesResponse {
  data: ManualResource[];
}

export async function getManuals({
  company,
  module,
}: getManualesProps): Promise<ManualResource[]> {
  const config: AxiosRequestConfig = {
    params: { company, module },
  };
  const { data } = await api.get<ManualesResponse>(MANUALS.ENDPOINT, config);
  return data.data;
}
