import type {
  CommercialMastersRequest,
  CommercialMastersResponse,
  CommercialMastersResource,
  getCommercialMastersProps,
} from "./commercialMasters.interface";
import { COMMERCIAL_MASTERS } from "./commercialMasters.constants";
import { api } from "@/core/api";

export const getCommercialMasters = async ({
  params,
}: getCommercialMastersProps): Promise<CommercialMastersResponse> => {
  const { data } = await api.get(COMMERCIAL_MASTERS.ENDPOINT, {
    params,
  });
  return data;
};

export const getCommercialMastersById = async (
  id: number
): Promise<CommercialMastersResource> => {
  const { data } = await api.get(`${COMMERCIAL_MASTERS.ENDPOINT}/${id}`);
  return data;
};

export const createCommercialMasters = async (
  body: CommercialMastersRequest
): Promise<CommercialMastersResource> => {
  const { data } = await api.post(COMMERCIAL_MASTERS.ENDPOINT, body);
  return data;
};

export const updateCommercialMasters = async (
  id: number,
  body: Partial<CommercialMastersRequest>
): Promise<CommercialMastersResource> => {
  const { data } = await api.put(`${COMMERCIAL_MASTERS.ENDPOINT}/${id}`, body);
  return data;
};

export const deleteCommercialMasters = async (id: number): Promise<void> => {
  await api.delete(`${COMMERCIAL_MASTERS.ENDPOINT}/${id}`);
};

export const getCommercialMastersTypes = async (): Promise<{
  data: string[];
  count: number;
  cached_at: string;
}> => {
  const { data } = await api.get(`${COMMERCIAL_MASTERS.ENDPOINT}/types`);
  return data;
};
