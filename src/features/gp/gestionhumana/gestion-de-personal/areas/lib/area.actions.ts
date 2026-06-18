import { api } from "@/core/api.ts";
import type { AxiosRequestConfig } from "axios";
import { AreaResource, AreaResponse, getAreasProps } from "./area.interface.ts";
import { AREA } from "./area.constant.ts";

const { ENDPOINT } = AREA;

export async function getAreas({
  params,
}: getAreasProps): Promise<AreaResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<AreaResponse>(ENDPOINT, config);
  return data;
}
export async function getAllAreas(): Promise<AreaResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
    },
  };
  const { data } = await api.get<AreaResource[]>(ENDPOINT, config);
  return data;
}
