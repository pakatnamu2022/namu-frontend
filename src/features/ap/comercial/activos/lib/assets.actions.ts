import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { ASSETS } from "./assets.constants";
import {
  AssetRequest,
  AssetResource,
  AssetResponse,
  EligibleVehicle,
  EligibleVehiclesResponse,
  getAssetsProps,
} from "./assets.interface";

const { ENDPOINT } = ASSETS;

export async function getAssets({
  params,
}: getAssetsProps): Promise<AssetResponse> {
  const config: AxiosRequestConfig = { params: { ...params } };
  const { data } = await api.get<AssetResponse>(ENDPOINT, config);
  return data;
}

export async function getEligibleVehicles(
  params?: Record<string, any>,
): Promise<EligibleVehiclesResponse> {
  const { data } = await api.get<EligibleVehiclesResponse>(
    `${ENDPOINT}/eligible-vehicles`,
    { params: { ...params } },
  );
  return data;
}

export async function getEligibleVehicleDetail(
  id: number,
): Promise<EligibleVehicle> {
  const { data } = await api.get<EligibleVehicle>(
    `${ENDPOINT}/eligible-vehicles/${id}`,
  );
  return data;
}

export async function storeAsset(
  payload: AssetRequest,
): Promise<AssetResource> {
  const { data } = await api.post<AssetResource>(ENDPOINT, payload);
  return data;
}

export async function deleteAsset(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}

export async function dispatchAssetMigration(
  id: number,
): Promise<GeneralResponse> {
  const { data } = await api.post<GeneralResponse>(
    `${ENDPOINT}/${id}/dispatch-migration`,
  );
  return data;
}
