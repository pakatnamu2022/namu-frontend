// import type { AxiosRequestConfig } from "axios";

import { api } from "@/core/api";
import { SedeGraphResource, UseStateGraphResource } from "./tics.interface";

export async function getUseStateGraph(): Promise<UseStateGraphResource[]> {
  const { data } = await api.get<UseStateGraphResource[]>(
    "/gp/tics/equipment/useStateGraph",
  );
  return data;
}

export async function getSedeGraph(): Promise<SedeGraphResource[]> {
  const { data } = await api.get<SedeGraphResource[]>(
    "/gp/tics/equipment/sedeGraph",
  );
  return data;
}
