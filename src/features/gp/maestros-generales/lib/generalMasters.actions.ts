import type {
  GeneralMastersRequest,
  GeneralMastersResponse,
  GeneralMastersResource,
  getGeneralMastersProps,
} from "./generalMasters.interface";
import { GENERAL_MASTERS } from "./generalMasters.constants";
import { api } from "@/core/api";

export const getGeneralMasters = async ({
  params,
}: getGeneralMastersProps): Promise<GeneralMastersResponse> => {
  const { data } = await api.get(GENERAL_MASTERS.ENDPOINT, {
    params,
  });
  return data;
};

export const getGeneralMastersById = async (
  id: number
): Promise<GeneralMastersResource> => {
  const { data } = await api.get(`${GENERAL_MASTERS.ENDPOINT}/${id}`);
  return data;
};

export const createGeneralMasters = async (
  body: GeneralMastersRequest
): Promise<GeneralMastersResource> => {
  const { data } = await api.post(GENERAL_MASTERS.ENDPOINT, body);
  return data;
};

export const updateGeneralMasters = async (
  id: number,
  body: Partial<GeneralMastersRequest>
): Promise<GeneralMastersResource> => {
  const { data } = await api.put(`${GENERAL_MASTERS.ENDPOINT}/${id}`, body);
  return data;
};

export const deleteGeneralMasters = async (id: number): Promise<void> => {
  await api.delete(`${GENERAL_MASTERS.ENDPOINT}/${id}`);
};

export const getGeneralMastersTypes = async (): Promise<{
  data: string[];
  count: number;
  cached_at: string;
}> => {
  const { data } = await api.get(`${GENERAL_MASTERS.ENDPOINT}/types`);
  return data;
};

export const getGeneralMasterByCode = async (
  code: string
): Promise<GeneralMastersResource> => {
  const { data } = await api.get<GeneralMastersResource[]>(
    GENERAL_MASTERS.ENDPOINT,
    {
      params: {
        all: "true",
        code,
      },
    }
  );
  return data[0];
};
