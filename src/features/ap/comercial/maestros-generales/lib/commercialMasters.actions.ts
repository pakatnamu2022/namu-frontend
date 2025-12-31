import { axiosClient } from "@/core/core.axios";
import type {
  CommercialMastersRequest,
  CommercialMastersResponse,
  CommercialMastersResource,
  getCommercialMastersProps,
} from "./commercialMasters.interface";
import { COMMERCIAL_MASTERS } from "./commercialMasters.constants";

export const getCommercialMasters = async ({
  params,
}: getCommercialMastersProps): Promise<CommercialMastersResponse> => {
  const { data } = await axiosClient.get(COMMERCIAL_MASTERS.ENDPOINT, {
    params,
  });
  return data;
};

export const getCommercialMastersById = async (
  id: number
): Promise<CommercialMastersResource> => {
  const { data } = await axiosClient.get(
    `${COMMERCIAL_MASTERS.ENDPOINT}/${id}`
  );
  return data;
};

export const createCommercialMasters = async (
  body: CommercialMastersRequest
): Promise<CommercialMastersResource> => {
  const { data } = await axiosClient.post(COMMERCIAL_MASTERS.ENDPOINT, body);
  return data;
};

export const updateCommercialMasters = async (
  id: number,
  body: Partial<CommercialMastersRequest>
): Promise<CommercialMastersResource> => {
  const { data } = await axiosClient.put(
    `${COMMERCIAL_MASTERS.ENDPOINT}/${id}`,
    body
  );
  return data;
};

export const deleteCommercialMasters = async (id: number): Promise<void> => {
  await axiosClient.delete(`${COMMERCIAL_MASTERS.ENDPOINT}/${id}`);
};
