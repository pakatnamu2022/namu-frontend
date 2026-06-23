import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { ManualResource, getManualesProps } from "./manuales.interface";
import { MANUALS } from "./manuales.constants";

interface ManualesResponse {
  data: ManualResource[];
}

export async function getManuals({
  vista_id,
}: getManualesProps): Promise<ManualResource[]> {
  const config: AxiosRequestConfig = {
    params: { vista_id },
  };
  const { data } = await api.get<ManualesResponse>(MANUALS.ENDPOINT, config);
  return data.data;
}

export async function getManualContent(id: number): Promise<string> {
  const { data } = await api.get<string>(`${MANUALS.ENDPOINT}/${id}/content`, {
    responseType: "text",
  });
  return data;
}
