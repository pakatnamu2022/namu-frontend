import { AP_MASTERS } from "./apMaster.constants";
import type {
  ApMastersRequest,
  ApMastersResource,
  ApMastersResponse,
  getApMastersProps,
} from "./apMasters.interface";
import { api } from "@/core/api";

export const getApMasters = async ({
  params,
}: getApMastersProps): Promise<ApMastersResponse> => {
  const { data } = await api.get(AP_MASTERS.ENDPOINT, {
    params,
  });
  return data;
};

export const getApMastersById = async (
  id: number
): Promise<ApMastersResource> => {
  const { data } = await api.get(`${AP_MASTERS.ENDPOINT}/${id}`);
  return data;
};

export const createApMasters = async (
  body: ApMastersRequest
): Promise<ApMastersResource> => {
  const { data } = await api.post(AP_MASTERS.ENDPOINT, body);
  return data;
};

export const updateApMasters = async (
  id: number,
  body: Partial<ApMastersRequest>
): Promise<ApMastersResource> => {
  const { data } = await api.put(`${AP_MASTERS.ENDPOINT}/${id}`, body);
  return data;
};

export const deleteApMasters = async (id: number): Promise<void> => {
  await api.delete(`${AP_MASTERS.ENDPOINT}/${id}`);
};

export const getApMastersTypes = async (): Promise<{
  data: string[];
  count: number;
  cached_at: string;
}> => {
  const { data } = await api.get(`${AP_MASTERS.ENDPOINT}/types`);
  return data;
};
