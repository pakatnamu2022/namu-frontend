import { api } from "@/core/api";
import { GP_MASTERS } from "./gpMaster.constants";
import {
  getGpMastersProps,
  GpMastersRequest,
  GpMastersResource,
  GpMastersResponse,
} from "./gpMaster.interface";

export const getGpMasters = async ({
  params,
}: getGpMastersProps): Promise<GpMastersResponse> => {
  const { data } = await api.get(GP_MASTERS.ENDPOINT, {
    params,
  });
  return data;
};

export const getGpMastersById = async (
  id: number,
): Promise<GpMastersResource> => {
  const { data } = await api.get(`${GP_MASTERS.ENDPOINT}/${id}`);
  return data;
};

export const createGpMasters = async (
  body: GpMastersRequest,
): Promise<GpMastersResource> => {
  const { data } = await api.post(GP_MASTERS.ENDPOINT, body);
  return data;
};

export const updateGpMasters = async (
  id: number,
  body: Partial<GpMastersRequest>,
): Promise<GpMastersResource> => {
  const { data } = await api.put(`${GP_MASTERS.ENDPOINT}/${id}`, body);
  return data;
};

export const deleteGpMasters = async (id: number): Promise<void> => {
  await api.delete(`${GP_MASTERS.ENDPOINT}/${id}`);
};
